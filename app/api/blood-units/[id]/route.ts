import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific blood unit
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access blood unit details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: params.id },
      include: {
        donation: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
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
            patient: true,
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

    if (!bloodUnit) {
      return NextResponse.json({ error: "Blood unit not found" }, { status: 404 })
    }

    return NextResponse.json(bloodUnit)
  } catch (error) {
    console.error("Error fetching blood unit:", error)
    return NextResponse.json({ error: "Failed to fetch blood unit" }, { status: 500 })
  }
}

// Update a blood unit
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and blood bank technicians can update blood units
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BLOOD_BANK_TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, notes } = await req.json()

    // Check if blood unit exists
    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: params.id },
    })

    if (!bloodUnit) {
      return NextResponse.json({ error: "Blood unit not found" }, { status: 404 })
    }

    // Update the blood unit
    const updatedBloodUnit = await prisma.bloodUnit.update({
      where: { id: params.id },
      data: {
        status,
        notes,
      },
    })

    return NextResponse.json(updatedBloodUnit)
  } catch (error) {
    console.error("Error updating blood unit:", error)
    return NextResponse.json({ error: "Failed to update blood unit" }, { status: 500 })
  }
}

// Delete a blood unit
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can delete blood units
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if blood unit exists
    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: params.id },
    })

    if (!bloodUnit) {
      return NextResponse.json({ error: "Blood unit not found" }, { status: 404 })
    }

    // Cannot delete blood units that are in use
    if (bloodUnit.status === "USED" || bloodUnit.transfusionId) {
      return NextResponse.json(
        { error: "Cannot delete blood unit that has been used in a transfusion" },
        { status: 400 },
      )
    }

    // Delete the blood unit
    await prisma.bloodUnit.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Blood unit deleted successfully" })
  } catch (error) {
    console.error("Error deleting blood unit:", error)
    return NextResponse.json({ error: "Failed to delete blood unit" }, { status: 500 })
  }
}

