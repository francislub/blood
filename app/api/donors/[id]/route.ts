import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific donor
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access donor details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const donor = await prisma.donor.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
        donations: {
          orderBy: {
            scheduledDate: "desc",
          },
          take: 5,
        },
      },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json(donor)
  } catch (error) {
    console.error("Error fetching donor:", error)
    return NextResponse.json({ error: "Failed to fetch donor" }, { status: 500 })
  }
}

// Update donor eligibility
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and blood bank technicians can update donor eligibility
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BLOOD_BANK_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eligibleToDonateSince, medicalHistory } = await req.json()

    const updatedDonor = await prisma.donor.update({
      where: { id: params.id },
      data: {
        eligibleToDonateSince: eligibleToDonateSince ? new Date(eligibleToDonateSince) : undefined,
        medicalHistory: medicalHistory,
      },
    })

    return NextResponse.json(updatedDonor)
  } catch (error) {
    console.error("Error updating donor eligibility:", error)
    return NextResponse.json({ error: "Failed to update donor eligibility" }, { status: 500 })
  }
}

