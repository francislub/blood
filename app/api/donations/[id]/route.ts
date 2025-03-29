import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific donation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access donation details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        bloodUnits: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error fetching donation:", error)
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 })
  }
}

// Update a donation
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and blood bank technicians can update donations
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BLOOD_BANK_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduledDate, actualDate, status, hemoglobinLevel, notes } = await req.json()

    // Check if donation exists
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Update the donation
    const updatedDonation = await prisma.donation.update({
      where: { id: params.id },
      data: {
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        actualDate: actualDate ? new Date(actualDate) : undefined,
        status,
        hemoglobinLevel,
        notes,
      },
    })

    // If donation is completed, update donor's last donation date
    if (status === "COMPLETED" && donation.status !== "COMPLETED") {
      await prisma.donor.update({
        where: { id: donation.donorId },
        data: {
          lastDonationDate: actualDate ? new Date(actualDate) : new Date(),
          // Set eligibility to donate again after 56 days (8 weeks)
          eligibleToDonateSince: new Date(new Date().setDate(new Date().getDate() + 56)),
        },
      })
    }

    return NextResponse.json(updatedDonation)
  } catch (error) {
    console.error("Error updating donation:", error)
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
  }
}

// Delete a donation
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can delete donations
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if donation exists
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        bloodUnits: true,
      },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Cannot delete donations with blood units
    if (donation.bloodUnits.length > 0) {
      return NextResponse.json({ error: "Cannot delete donation with associated blood units" }, { status: 400 })
    }

    // Delete the donation
    await prisma.donation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Donation deleted successfully" })
  } catch (error) {
    console.error("Error deleting donation:", error)
    return NextResponse.json({ error: "Failed to delete donation" }, { status: 500 })
  }
}

