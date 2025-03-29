import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    const userId = session.user.id

    // Common stats for all users
    const totalDonations = await prisma.donation.count({
      where: { status: "COMPLETED" },
    })

    // Get current month's first day
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const recentDonations = await prisma.donation.count({
      where: {
        status: "COMPLETED",
        actualDate: {
          gte: firstDayOfMonth,
        },
      },
    })

    // Role-specific stats
    let roleSpecificStats = {}

    if (userRole === "DONOR") {
      // Get donor profile
      const donor = await prisma.donor.findUnique({
        where: { userId },
        include: {
          donations: {
            where: { status: "COMPLETED" },
            orderBy: { actualDate: "desc" },
            take: 1,
          },
        },
      })

      // Calculate next eligible date (56 days after last donation)
      let nextEligibleDate = null
      if (donor?.donations?.length > 0 && donor.donations[0].actualDate) {
        const lastDonationDate = new Date(donor.donations[0].actualDate)
        const eligibleDate = new Date(lastDonationDate)
        eligibleDate.setDate(eligibleDate.getDate() + 56)
        nextEligibleDate = eligibleDate.toISOString()
      }

      // Calculate total blood volume donated
      const totalDonated = await prisma.donation.aggregate({
        where: {
          donorId: donor?.id,
          status: "COMPLETED",
        },
        _sum: {
          volume: true,
        },
      })

      roleSpecificStats = {
        nextEligibleDate,
        totalDonated: totalDonated._sum.volume || 0,
      }
    }

    if (userRole === "MEDICAL_OFFICER" || userRole === "ADMIN") {
      const pendingRequests = await prisma.bloodRequest.count({
        where: { status: "PENDING" },
      })

      const scheduledTransfusions = await prisma.transfusion.count({
        where: { status: "SCHEDULED" },
      })

      roleSpecificStats = {
        pendingRequests,
        scheduledTransfusions,
      }
    }

    if (userRole === "ADMIN") {
      const totalDonors = await prisma.donor.count()

      const totalPatients = await prisma.patient.count()

      // Get blood types with low inventory (less than 10 units)
      const bloodInventory = await prisma.bloodUnit.groupBy({
        by: ["bloodType"],
        where: {
          status: "AVAILABLE",
        },
        _count: {
          id: true,
        },
      })

      const lowInventory = bloodInventory
        .filter((item) => item._count.id < 10)
        .map((item) => ({
          bloodType: item.bloodType,
          units: item._count.id,
        }))

      roleSpecificStats = {
        ...roleSpecificStats,
        totalDonors,
        totalPatients,
        lowInventory,
      }
    }

    return NextResponse.json({
      totalDonations,
      recentDonations,
      ...roleSpecificStats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}

