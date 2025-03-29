import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Create a new donation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can create donations
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { donorId, scheduledDate, status, notes } = await req.json()

    // Check if donor exists and is eligible
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Check eligibility if the donor has eligibleToDonateSince set
    if (donor.eligibleToDonateSince && donor.eligibleToDonateSince > new Date()) {
      return NextResponse.json({ error: "Donor is not eligible to donate at this time" }, { status: 400 })
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        donorId,
        scheduledDate: new Date(scheduledDate),
        status,
        notes,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}

// Get all donations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For donor role, get only their donations
    if (session.user.role === "DONOR") {
      const donor = await prisma.donor.findUnique({
        where: { userId: session.user.id },
      })

      if (!donor) {
        return NextResponse.json({ error: "Donor profile not found" }, { status: 404 })
      }

      const donations = await prisma.donation.findMany({
        where: { donorId: donor.id },
        include: {
          bloodUnits: {
            select: {
              id: true,
              volume: true,
            },
          },
        },
        orderBy: {
          scheduledDate: "desc",
        },
      })

      return NextResponse.json(donations)
    }

    // For admin and medical staff, get all donations
    // Add filters, pagination etc. as needed
    const donations = await prisma.donation.findMany({
      include: {
        donor: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
            bloodType: true,
          },
        },
        bloodUnits: {
          select: {
            id: true,
            volume: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    })

    return NextResponse.json(donations)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}

