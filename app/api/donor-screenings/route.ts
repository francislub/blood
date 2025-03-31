import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to view screenings
    if (!["ADMIN", "MEDICAL_OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all screenings with donor information
    const screenings = await prisma.donorScreening.findMany({
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        doctor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform data for the frontend
    const formattedScreenings = screenings.map((screening) => ({
      id: screening.id,
      donorId: screening.donorId,
      donorName: screening.donor.user.name,
      bloodType: screening.donor.bloodType,
      status: screening.status,
      date: screening.createdAt?.toISOString(),
      scheduledDate: screening.scheduledDate?.toISOString(),
      vitals: screening.vitals ? JSON.parse(screening.vitals as string) : null,
      doctorName: screening.doctor?.user.name || null,
      deferralReason: screening.deferralReason,
      deferralPeriod: screening.deferralPeriod,
      notes: screening.notes,
    }))

    return NextResponse.json(formattedScreenings)
  } catch (error) {
    console.error("Error fetching donor screenings:", error)
    return NextResponse.json({ error: "Failed to fetch donor screenings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create screenings
    if (!["ADMIN", "MEDICAL_OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get medical officer ID
    const medicalOfficer = await prisma.medicalOfficer.findUnique({
      where: { userId: session.user.id },
    })

    if (!medicalOfficer) {
      return NextResponse.json({ error: "Medical officer profile not found" }, { status: 404 })
    }

    const data = await req.json()

    // Create the screening record
    const screening = await prisma.donorScreening.create({
      data: {
        donorId: data.donorId,
        doctorId: medicalOfficer.id,
        status: data.status,
        vitals: JSON.stringify(data.vitals),
        questionnaireCompleted: data.questionnaireCompleted || false,
        deferralReason: data.deferralReason,
        deferralPeriod: data.deferralPeriod,
        notes: data.notes,
      },
    })

    // Update donor eligibility status if deferred
    if (data.status === "DEFERRED") {
      await prisma.donor.update({
        where: { id: data.donorId },
        data: {
          eligibility: "DEFERRED",
          nextEligibleDate: calculateNextEligibleDate(data.deferralPeriod),
        },
      })
    } else if (data.status === "ELIGIBLE") {
      await prisma.donor.update({
        where: { id: data.donorId },
        data: {
          eligibility: "ELIGIBLE",
          nextEligibleDate: null,
        },
      })
    }

    return NextResponse.json({
      id: screening.id,
      status: "success",
      message: "Donor screening recorded successfully",
    })
  } catch (error) {
    console.error("Error creating donor screening:", error)
    return NextResponse.json({ error: "Failed to create donor screening" }, { status: 500 })
  }
}

// Helper function to calculate next eligible date based on deferral period
function calculateNextEligibleDate(deferralPeriod: string | null): Date | null {
  if (!deferralPeriod) return null

  const now = new Date()

  switch (deferralPeriod) {
    case "1-month":
      return new Date(now.setMonth(now.getMonth() + 1))
    case "3-months":
      return new Date(now.setMonth(now.getMonth() + 3))
    case "6-months":
      return new Date(now.setMonth(now.getMonth() + 6))
    case "12-months":
      return new Date(now.setMonth(now.getMonth() + 12))
    case "permanent":
      // Set to a far future date for permanent deferral
      return new Date(now.setFullYear(now.getFullYear() + 100))
    default:
      return null
  }
}

