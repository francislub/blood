import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get blood inventory report
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access reports
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get blood units by blood type and status
    const bloodUnitsByType = await prisma.bloodUnit.groupBy({
      by: ["bloodType", "status"],
      _count: {
        id: true,
      },
    })

    // Get expiring blood units (within next 7 days)
    const expiringDate = new Date()
    expiringDate.setDate(expiringDate.getDate() + 7)

    const expiringBloodUnits = await prisma.bloodUnit.findMany({
      where: {
        status: "AVAILABLE",
        expiryDate: {
          lte: expiringDate,
          gte: new Date(),
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    })

    // Get recently added blood units (last 7 days)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 7)

    const recentBloodUnits = await prisma.bloodUnit.count({
      where: {
        createdAt: {
          gte: recentDate,
        },
      },
    })

    // Format the data for the report
    const inventoryByBloodType = {}

    bloodUnitsByType.forEach((item) => {
      if (!inventoryByBloodType[item.bloodType]) {
        inventoryByBloodType[item.bloodType] = {
          AVAILABLE: 0,
          RESERVED: 0,
          USED: 0,
          EXPIRED: 0,
          DISCARDED: 0,
          total: 0,
        }
      }

      inventoryByBloodType[item.bloodType][item.status] = item._count.id
      inventoryByBloodType[item.bloodType].total += item._count.id
    })

    const report = {
      inventoryByBloodType,
      expiringBloodUnits,
      recentBloodUnits,
      totalAvailable: bloodUnitsByType
        .filter((item) => item.status === "AVAILABLE")
        .reduce((sum, item) => sum + item._count.id, 0),
      generatedAt: new Date(),
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating inventory report:", error)
    return NextResponse.json({ error: "Failed to generate inventory report" }, { status: 500 })
  }
}

