import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get donations report
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access reports
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const startDate = url.searchParams.get("startDate")
      ? new Date(url.searchParams.get("startDate"))
      : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate")) : new Date()

    // Get donations by status
    const donationsByStatus = await prisma.donation.groupBy({
      by: ["status"],
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Get donations by blood type
    const donationsByBloodType = await prisma.donation.groupBy({
      by: ["donor.bloodType"],
      where: {
        status: "COMPLETED",
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Get monthly donation trends
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyDonations = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "scheduledDate") as month,
        COUNT(*) as count
      FROM "Donation"
      WHERE 
        "status" = 'COMPLETED' AND
        "scheduledDate" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `

    // Get top donors
    const topDonors = await prisma.donor.findMany({
      where: {
        donations: {
          some: {
            status: "COMPLETED",
            scheduledDate: {
              gte: sixMonthsAgo,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            donations: {
              where: {
                status: "COMPLETED",
                scheduledDate: {
                  gte: sixMonthsAgo,
                },
              },
            },
          },
        },
      },
      orderBy: {
        donations: {
          _count: "desc",
        },
      },
      take: 10,
    })

    // Format the data for the report
    const report = {
      donationsByStatus: donationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {}),
      donationsByBloodType: donationsByBloodType.reduce((acc, item) => {
        acc[item.bloodType] = item._count.id
        return acc
      }, {}),
      monthlyTrends: monthlyDonations,
      topDonors: topDonors.map((donor) => ({
        id: donor.id,
        name: donor.user.name,
        bloodType: donor.bloodType,
        donationCount: donor._count.donations,
      })),
      totalCompletedDonations: donationsByStatus.find((item) => item.status === "COMPLETED")?._count.id || 0,
      period: {
        startDate,
        endDate,
      },
      generatedAt: new Date(),
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating donations report:", error)
    return NextResponse.json({ error: "Failed to generate donations report" }, { status: 500 })
  }
}

