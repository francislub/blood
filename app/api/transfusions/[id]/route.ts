import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific transfusion
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access transfusion details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transfusion = await prisma.transfusion.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        request: true,
        medicalOfficer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        bloodUnits: true,
      },
    })

    if (!transfusion) {
      return NextResponse.json({ error: "Transfusion not found" }, { status: 404 })
    }

    // If medical officer, check if they performed this transfusion
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer && transfusion.medicalOfficerId !== medicalOfficer.id) {
        return NextResponse.json({ error: "You are not authorized to view this transfusion" }, { status: 403 })
      }
    }

    return NextResponse.json(transfusion)
  } catch (error) {
    console.error("Error fetching transfusion:", error)
    return NextResponse.json({ error: "Failed to fetch transfusion" }, { status: 500 })
  }
}

// Update a transfusion
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only medical officers who performed the transfusion can update it
    if (!session || session.user.role !== "MEDICAL_OFFICER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transfusionDate, notes } = await req.json()

    // Check if transfusion exists
    const transfusion = await prisma.transfusion.findUnique({
      where: { id: params.id },
    })

    if (!transfusion) {
      return NextResponse.json({ error: "Transfusion not found" }, { status: 404 })
    }

    // Check if medical officer performed this transfusion
    const medicalOfficer = await prisma.medicalOfficer.findUnique({
      where: { userId: session.user.id },
    })

    if (!medicalOfficer || transfusion.medicalOfficerId !== medicalOfficer.id) {
      return NextResponse.json({ error: "You are not authorized to update this transfusion" }, { status: 403 })
    }

    // Update the transfusion
    const updatedTransfusion = await prisma.transfusion.update({
      where: { id: params.id },
      data: {
        transfusionDate: transfusionDate ? new Date(transfusionDate) : undefined,
        notes,
      },
    })

    return NextResponse.json(updatedTransfusion)
  } catch (error) {
    console.error("Error updating transfusion:", error)
    return NextResponse.json({ error: "Failed to update transfusion" }, { status: 500 })
  }
}

