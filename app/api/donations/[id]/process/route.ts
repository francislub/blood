import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only blood bank technicians and admins can process donations
    if (!session || (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bloodPressure, hemoglobin, weight, temperature, pulse, units, notes } = await req.json()

    // Validate input
    if (!bloodPressure || !hemoglobin || !weight || !temperature || !pulse || !units) {
      return NextResponse.json({ error: "All vital signs are required" }, { status: 400 })
    }

    // Check if donation exists and is scheduled
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        donor: true,
      },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    if (donation.status !== "SCHEDULED") {
      return NextResponse.json({ error: `Donation is already ${donation.status.toLowerCase()}` }, { status: 400 })
    }

    // Get technician ID
    let technicianId = null
    if (session.user.role === "BLOOD_BANK_TECHNICIAN") {
      const technician = await prisma.bloodBankTechnician.findUnique({
        where: { userId: session.user.id },
      })

      if (!technician) {
        return NextResponse.json({ error: "Technician profile not found" }, { status: 404 })
      }

      technicianId = technician.id
    }

    // Calculate next eligible donation date (typically 56 days or 8 weeks after donation)
    const eligibleNextDate = new Date(donation.date)
    eligibleNextDate.setDate(eligibleNextDate.getDate() + 56)

    // Start a transaction to update donation and create blood units
    const result = await prisma.$transaction(async (tx) => {
      // Update the donation
      const updatedDonation = await tx.donation.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          technicianId,
          bloodPressure,
          hemoglobin,
          weight,
          temperature,
          pulse,
          units,
          notes: notes ? `${donation.notes ? donation.notes + "\n\n" : ""}${notes}` : donation.notes,
          eligibleNextDate,
        },
      })

      // Update donor's last donation date and next eligible date
      await tx.donor.update({
        where: { id: donation.donorId },
        data: {
          lastDonationDate: donation.date,
          eligibleToDonateSince: eligibleNextDate,
          donationCount: {
            increment: 1,
          },
        },
      })

      // Create blood units
      const bloodUnits = []
      for (let i = 0; i < units; i++) {
        // Calculate expiry date (35 days from donation date)
        const expiryDate = new Date(donation.date)
        expiryDate.setDate(expiryDate.getDate() + 35)

        // Generate unit number
        const unitNumber = `BU-${donation.donorId.substring(0, 4)}-${new Date().getTime().toString().substring(9, 13)}-${i + 1}`

        const bloodUnit = await tx.bloodUnit.create({
          data: {
            unitNumber,
            bloodType: donation.donor.bloodType,
            collectionDate: donation.date,
            expiryDate,
            volume: 450, // Standard volume in ml
            status: "AVAILABLE",
            donationId: donation.id,
          },
        })

        bloodUnits.push(bloodUnit)
      }

      return { updatedDonation, bloodUnits }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing donation:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 })
  }
}

