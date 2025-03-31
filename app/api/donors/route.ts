import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get all donors
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access donor list
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const bloodType = url.searchParams.get("bloodType")
    const eligibleOnly = url.searchParams.get("eligibleOnly") === "true"

    // Build the query
    const where: any = {}

    if (bloodType) {
      where.bloodType = bloodType
    }

    if (eligibleOnly) {
      where.eligibleToDonateSince = {
        lte: new Date(),
      }
    }

    const donors = await prisma.donor.findMany({
      where,
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
      },
    })

    return NextResponse.json(donors)
  } catch (error) {
    console.error("Error fetching donors:", error)
    return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 })
  }
}

