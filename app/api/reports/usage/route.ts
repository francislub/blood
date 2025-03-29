import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get blood usage report
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

    // Get transfusions by blood type
    const transfusionsByBloodType = await prisma.bloodUnit.groupBy({
      by: ["bloodType"],
      where: {
        status: "USED",
        transfusion: {
          transfusionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _count: {
        id: true,
      },
    })

    // Get monthly transfusion trends
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTransfusions = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "transfusionDate") as month,
        COUNT(*) as count
      FROM "Transfusion"
      WHERE 
        "transfusionDate" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `

    // Get top medical officers by transfusions
    const topMedicalOfficers = await prisma.medicalOfficer.findMany({
      where: {
        transfusions: {
          some: {
            transfusionDate: {
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
            transfusions: {
              where: {
                transfusionDate: {
                  gte: sixMonthsAgo,
                },
              },
            },
          },
        },
      },
      orderBy: {
        transfusions: {
          _count: "desc",
        },
      },
      take: 10,
    })

    // Get blood requests by urgency
    const requestsByUrgency = await prisma.bloodRequest.groupBy({
      by: ["urgency"],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Format the data for the report
    const report = {
      transfusionsByBloodType: transfusionsByBloodType.reduce((acc, item) => {
        acc[item.bloodType] = item._count.id
        return acc
      }, {}),
      monthlyTrends: monthlyTransfusions,
      topMedicalOfficers: topMedicalOfficers.map((officer) => ({
        id: officer.id,
        name: officer.user.name,
        department: officer.department,
        transfusionCount: officer._count.transfusions,
      })),
      requestsByUrgency: requestsByUrgency.reduce((acc, item) => {
        acc[item.urgency] = item._count.id
        return acc
      }, {}),
      totalUsedUnits: transfusionsByBloodType.reduce((sum, item) => sum + item._count.id, 0),
      period: {
        startDate,
        endDate,
      },
      generatedAt: new Date(),
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating usage report:", error)
    return NextResponse.json({ error: "Failed to generate usage report" }, { status: 500 })
  }
}

