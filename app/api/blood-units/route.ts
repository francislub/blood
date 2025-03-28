import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// Create a new blood unit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and blood bank technicians can create blood units
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BLOOD_BANK_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { unitNumber, bloodType, collectionDate, expiryDate, status, volume, donationId, notes } = await req.json()

    // Check if unit number already exists
    const existingUnit = await prisma.bloodUnit.findUnique({
      where: { unitNumber },
    })

    if (existingUnit) {
      return NextResponse.json({ error: "Blood unit with this unit number already exists" }, { status: 400 })
    }

    // If donation ID is provided, check if it exists
    if (donationId) {
      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
      })

      if (!donation) {
        return NextResponse.json({ error: "Donation not found" }, { status: 404 })
      }

      // Check if donation is completed
      if (donation.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Cannot add blood unit to a donation that is not completed" },
          { status: 400 },
        )
      }
    }

    // Get technician ID if the user is a blood bank technician
    let technicianId = null
    if (session.user.role === "BLOOD_BANK_TECHNICIAN") {
      const technician = await prisma.bloodBankTechnician.findUnique({
        where: { userId: session.user.id },
      })

      if (technician) {
        technicianId = technician.id
      }
    }

    // Create the blood unit
    const bloodUnit = await prisma.bloodUnit.create({
      data: {
        unitNumber,
        bloodType,
        collectionDate: new Date(collectionDate),
        expiryDate: new Date(expiryDate),
        status,
        volume,
        donationId,
        technicianId,
        notes,
      },
    })

    return NextResponse.json(bloodUnit, { status: 201 })
  } catch (error) {
    console.error("Error creating blood unit:", error)
    return NextResponse.json({ error: "Failed to create blood unit" }, { status: 500 })
  }
}

// Get all blood units
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access blood units
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const bloodType = url.searchParams.get("bloodType")
    const status = url.searchParams.get("status")
    const expiryBefore = url.searchParams.get("expiryBefore")
    const availableOnly = url.searchParams.get("availableOnly") === "true"

    // Build the query
    const where: any = {}

    if (bloodType) {
      where.bloodType = bloodType
    }

    if (status) {
      where.status = status
    } else if (availableOnly) {
      where.status = "AVAILABLE"
    }

    if (expiryBefore) {
      where.expiryDate = {
        lte: new Date(expiryBefore),
      }
    }

    const bloodUnits = await prisma.bloodUnit.findMany({
      where,
      include: {
        donation: {
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
        transfusion: {
          include: {
            patient: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    })

    return NextResponse.json(bloodUnits)
  } catch (error) {
    console.error("Error fetching blood units:", error)
    return NextResponse.json({ error: "Failed to fetch blood units" }, { status: 500 })
  }
}

