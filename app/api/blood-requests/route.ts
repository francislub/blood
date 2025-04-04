import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Create a new blood request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can create blood requests
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { bloodType, urgency, patientId, notes, requiredBy } = data

    // Handle both units and quantity fields to ensure compatibility
    const quantity = data.quantity || data.units

    if (!quantity) {
      return NextResponse.json({ error: "Quantity is required" }, { status: 400 })
    }

    // Check if patient exists
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }
    }

    // Create the blood request with the correct field names
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        requesterId: session.user.id,
        bloodType,
        quantity: Number(quantity), // Ensure it's a number
        urgency,
        purpose: data.reason || data.purpose, // Handle both field names
        patientId,
        notes,
        requiredBy: requiredBy ? new Date(requiredBy) : undefined,
        status: "PENDING",
      },
    })

    return NextResponse.json(bloodRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating blood request:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to create blood request" }, { status: 500 })
  }
}

// Get all blood requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access blood requests
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const bloodType = url.searchParams.get("bloodType")
    const urgency = url.searchParams.get("urgency")

    // Build the query
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (bloodType) {
      where.bloodType = bloodType
    }

    if (urgency) {
      where.urgency = urgency
    }

    // If medical officer, only show their requests
    if (session.user.role === "MEDICAL_OFFICER") {
      where.requesterId = session.user.id
    }

    const bloodRequests = await prisma.bloodRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            hospitalId: true,
            bloodType: true,
          },
        },
        transfusions: {
          include: {
            bloodUnits: {
              select: {
                id: true,
                unitNumber: true,
                bloodType: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    })

    return NextResponse.json(bloodRequests)
  } catch (error) {
    console.error("Error fetching blood requests:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch blood requests" }, { status: 500 })
  }
}

