import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { donorId, appointmentDate, notes } = await req.json()

    // Validate input
    if (!donorId || !appointmentDate) {
      return NextResponse.json({ error: "Donor ID and appointment date are required" }, { status: 400 })
    }

    // Check if donor exists
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        user: true,
      },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Check if donor is eligible to donate
    if (donor.eligibleToDonateSince && new Date(donor.eligibleToDonateSince) > new Date()) {
      return NextResponse.json(
        {
          error: `Donor is not eligible to donate until ${new Date(donor.eligibleToDonateSince).toLocaleDateString()}`,
        },
        { status: 400 },
      )
    }

    // Create donation record with SCHEDULED status
    const donation = await prisma.donation.create({
      data: {
        donorId,
        date: new Date(appointmentDate),
        status: "SCHEDULED",
        notes,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Error scheduling donation:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to schedule donation" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const donorId = url.searchParams.get("donorId")
    const date = url.searchParams.get("date")
    const status = url.searchParams.get("status")

    const where: any = {}

    if (donorId) {
      where.donorId = donorId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    if (status) {
      where.status = status
    }

    // If user is a donor, only show their own appointments
    if (session.user.role === "DONOR") {
      const donor = await prisma.donor.findFirst({
        where: { userId: session.user.id },
      })

      if (donor) {
        where.donorId = donor.id
      } else {
        return NextResponse.json([])
      }
    }

    const appointments = await prisma.donation.findMany({
      where,
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
        technician: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching donation appointments:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch donation appointments" }, { status: 500 })
  }
}

