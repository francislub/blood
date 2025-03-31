import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only medical officers, technicians, and admins can access blood unit status
    if (!["ADMIN", "MEDICAL_OFFICER", "BLOOD_BANK_TECHNICIAN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Count available blood units by blood type
    const bloodUnits = await prisma.bloodUnit.groupBy({
      by: ["bloodType"],
      where: {
        status: "AVAILABLE",
      },
      _count: {
        id: true,
      },
    })

    // Format the response
    const bloodInventory = {}
    bloodUnits.forEach((unit) => {
      bloodInventory[unit.bloodType] = unit._count.id
    })

    return NextResponse.json(bloodInventory)
  } catch (error) {
    console.error("Error fetching blood unit status:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch blood unit status" }, { status: 500 })
  }
}

