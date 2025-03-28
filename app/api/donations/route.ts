import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

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

    // Only authenticated users can access donations
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const donorId = url.searchParams.get("donorId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Build the query
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (donorId) {
      where.donorId = donorId
    }

    if (startDate || endDate) {
      where.scheduledDate = {}

      if (startDate) {
        where.scheduledDate.gte = new Date(startDate)
      }

      if (endDate) {
        where.scheduledDate.lte = new Date(endDate)
      }
    }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
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

