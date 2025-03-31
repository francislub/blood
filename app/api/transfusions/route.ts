import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Create a new transfusion
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only medical officers can create transfusions
    if (!session || session.user.role !== "MEDICAL_OFFICER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientId, requestId, transfusionDate, bloodUnitIds, notes } = await req.json()

    // Get medical officer ID
    const medicalOfficer = await prisma.medicalOfficer.findUnique({
      where: { userId: session.user.id },
    })

    if (!medicalOfficer) {
      return NextResponse.json({ error: "Medical officer profile not found" }, { status: 404 })
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check if blood request exists
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
    })

    if (!bloodRequest) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 })
    }

    // Check if blood units exist and are available
    const bloodUnits = await prisma.bloodUnit.findMany({
      where: {
        id: { in: bloodUnitIds },
        status: "AVAILABLE",
      },
    })

    if (bloodUnits.length !== bloodUnitIds.length) {
      return NextResponse.json({ error: "One or more blood units are not available" }, { status: 400 })
    }

    // Create the transfusion and update blood units in a transaction
    const transfusion = await prisma.$transaction(async (tx) => {
      // Create transfusion
      const newTransfusion = await tx.transfusion.create({
        data: {
          patientId,
          requestId,
          medicalOfficerId: medicalOfficer.id,
          transfusionDate: new Date(transfusionDate),
          notes,
        },
      })

      // Update blood units
      for (const unitId of bloodUnitIds) {
        await tx.bloodUnit.update({
          where: { id: unitId },
          data: {
            status: "USED",
            transfusionId: newTransfusion.id,
          },
        })
      }

      // Update blood request status if all units are fulfilled
      if (bloodUnits.length >= bloodRequest.quantity) {
        await tx.bloodRequest.update({
          where: { id: requestId },
          data: {
            status: "FULFILLED",
          },
        })
      }

      return newTransfusion
    })

    return NextResponse.json(transfusion, { status: 201 })
  } catch (error) {
    console.error("Error creating transfusion:", error)
    return NextResponse.json({ error: "Failed to create transfusion" }, { status: 500 })
  }
}

// Get all transfusions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access transfusions
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const patientId = url.searchParams.get("patientId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Build the query
    const where: any = {}

    if (patientId) {
      where.patientId = patientId
    }

    if (startDate || endDate) {
      where.transfusionDate = {}

      if (startDate) {
        where.transfusionDate.gte = new Date(startDate)
      }

      if (endDate) {
        where.transfusionDate.lte = new Date(endDate)
      }
    }

    // If medical officer, only show their transfusions
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer) {
        where.medicalOfficerId = medicalOfficer.id
      }
    }

    const transfusions = await prisma.transfusion.findMany({
      where,
      include: {
        patient: true,
        request: true,
        medicalOfficer: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        bloodUnits: {
          select: {
            id: true,
            unitNumber: true,
            bloodType: true,
          },
        },
      },
      orderBy: {
        transfusionDate: "desc",
      },
    })

    return NextResponse.json(transfusions)
  } catch (error) {
    console.error("Error fetching transfusions:", error)
    return NextResponse.json({ error: "Failed to fetch transfusions" }, { status: 500 })
  }
}

