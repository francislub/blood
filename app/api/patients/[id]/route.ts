import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific patient
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access patient details
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
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
        transfusions: {
          include: {
            bloodUnits: true,
            request: true,
          },
          orderBy: {
            transfusionDate: "desc",
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // If medical officer, check if they are assigned to this patient
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer && patient.medicalOfficerId !== medicalOfficer.id) {
        return NextResponse.json({ error: "You are not authorized to view this patient" }, { status: 403 })
      }
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

// Update a patient
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and medical officers can update patients
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MEDICAL_OFFICER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, hospitalId, dateOfBirth, gender, bloodType, contactNumber, address, medicalOfficerId } =
      await req.json()

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // If medical officer, check if they are assigned to this patient
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer && patient.medicalOfficerId !== medicalOfficer.id) {
        return NextResponse.json({ error: "You are not authorized to update this patient" }, { status: 403 })
      }
    }

    // Check if hospital ID is being changed and if it's already in use
    if (hospitalId !== patient.hospitalId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { hospitalId },
      })

      if (existingPatient && existingPatient.id !== params.id) {
        return NextResponse.json({ error: "Patient with this hospital ID already exists" }, { status: 400 })
      }
    }

    // Update the patient
    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        name,
        hospitalId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodType,
        contactNumber,
        address,
        medicalOfficerId: session.user.role === "ADMIN" ? medicalOfficerId : undefined,
      },
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

// Delete a patient
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can delete patients
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        transfusions: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Cannot delete patients with transfusions
    if (patient.transfusions.length > 0) {
      return NextResponse.json({ error: "Cannot delete patient with transfusion history" }, { status: 400 })
    }

    // Delete the patient
    await prisma.patient.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}

