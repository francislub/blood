import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { components } = await req.json()

    // Validate donation exists
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Start a transaction to update donation and create blood units
    const result = await prisma.$transaction(async (tx) => {
      // Update donation status
      const updatedDonation = await tx.donation.update({
        where: { id: params.id },
        data: {
          status: "PROCESSED",
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      })

      // Create blood units for each component
      const bloodUnits = []
      for (const component of components) {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + component.expiryDays)

        const bloodUnit = await tx.bloodUnit.create({
          data: {
            donationId: params.id,
            bloodType: component.bloodType,
            componentType: component.type,
            volume: component.volume,
            status: "AVAILABLE",
            expiryDate,
            notes: component.notes,
            unitNumber: `${donation.donationId}-${component.type.substring(0, 3)}-${Math.floor(Math.random() * 1000)}`,
          },
        })
        bloodUnits.push(bloodUnit)
      }

      return { donation: updatedDonation, bloodUnits }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing donation:", error)
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 })
  }
}

