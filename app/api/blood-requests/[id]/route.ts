import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific blood request
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access blood request details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: params.id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        transfusions: {
          include: {
            bloodUnits: true,
            medicalOfficer: {
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
      },
    })

    if (!bloodRequest) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 })
    }

    // If medical officer, check if they created this request
    if (session.user.role === "MEDICAL_OFFICER" && bloodRequest.requesterId !== session.user.id) {
      return NextResponse.json({ error: "You are not authorized to view this blood request" }, { status: 403 })
    }

    return NextResponse.json(bloodRequest)
  } catch (error) {
    console.error("Error fetching blood request:", error)
    return NextResponse.json({ error: "Failed to fetch blood request" }, { status: 500 })
  }
}

// Update a blood request status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and blood bank technicians can update blood request status
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BLOOD_BANK_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, notes } = await req.json()

    // Check if blood request exists
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: params.id },
    })

    if (!bloodRequest) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 })
    }

    // Update the blood request
    const updatedBloodRequest = await prisma.bloodRequest.update({
      where: { id: params.id },
      data: {
        status,
        notes,
      },
    })

    return NextResponse.json(updatedBloodRequest)
  } catch (error) {
    console.error("Error updating blood request:", error)
    return NextResponse.json({ error: "Failed to update blood request" }, { status: 500 })
  }
}

// Delete a blood request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and the requester can delete blood requests
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: params.id },
      include: {
        transfusions: true,
      },
    })

    if (!session || (session.user.role !== "ADMIN" && bloodRequest.requesterId !== session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!bloodRequest) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 })
    }

    // Cannot delete blood requests with transfusions
    if (bloodRequest.transfusions.length > 0) {
      return NextResponse.json({ error: "Cannot delete blood request with associated transfusions" }, { status: 400 })
    }

    // Delete the blood request
    await prisma.bloodRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Blood request deleted successfully" })
  } catch (error) {
    console.error("Error deleting blood request:", error)
    return NextResponse.json({ error: "Failed to delete blood request" }, { status: 500 })
  }
}

