import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only medical officers and admins can create medical records
    if (!session || (session.user.role !== "MEDICAL_OFFICER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientId, recordType, title, details } = await req.json()

    // Validate input
    if (!patientId || !recordType || !title) {
      return NextResponse.json({ error: "Patient ID, record type, and title are required" }, { status: 400 })
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get medical officer ID
    let medicalOfficerId = null
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (!medicalOfficer) {
        return NextResponse.json({ error: "Medical officer profile not found" }, { status: 404 })
      }

      medicalOfficerId = medicalOfficer.id
    } else if (session.user.role === "ADMIN") {
      // If admin, find a medical officer associated with the patient
      if (patient.medicalOfficerId) {
        medicalOfficerId = patient.medicalOfficerId
      } else {
        // Find any medical officer
        const anyMedicalOfficer = await prisma.medicalOfficer.findFirst()
        if (anyMedicalOfficer) {
          medicalOfficerId = anyMedicalOfficer.id
        } else {
          return NextResponse.json({ error: "No medical officers found in the system" }, { status: 400 })
        }
      }
    }

    // Create the medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        medicalOfficerId,
        recordType,
        title,
        details,
      },
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
    })

    return NextResponse.json(medicalRecord, { status: 201 })
  } catch (error) {
    console.error("Error creating medical record:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only medical officers and admins can access medical records
    if (!session || (session.user.role !== "MEDICAL_OFFICER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const patientId = url.searchParams.get("patientId")
    const recordType = url.searchParams.get("recordType")

    const where: any = {}

    if (patientId) {
      where.patientId = patientId
    }

    if (recordType) {
      where.recordType = recordType
    }

    // If medical officer, only show records for their patients
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer) {
        where.medicalOfficerId = medicalOfficer.id
      }
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(medicalRecords)
  } catch (error) {
    console.error("Error fetching medical records:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
  }
}

