import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to view medical records
    if (!["ADMIN", "MEDICAL_OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all medical records with patient information
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
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

    // Transform data for the frontend
    const formattedRecords = records.map((record) => ({
      id: record.id,
      patientId: record.patientId,
      patient: {
        id: record.patient.id,
        name: record.patient.name,
      },
      recordType: record.recordType,
      date: record.createdAt.toISOString(),
      title: record.title,
      summary: record.summary,
      details: record.details,
      doctorName: record.doctor.user.name,
      relatedItems: record.relatedItems ? JSON.parse(record.relatedItems as string) : undefined,
    }))

    return NextResponse.json(formattedRecords)
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create medical records
    if (!["ADMIN", "MEDICAL_OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get medical officer ID
    const medicalOfficer = await prisma.medicalOfficer.findUnique({
      where: { userId: session.user.id },
    })

    if (!medicalOfficer) {
      return NextResponse.json({ error: "Medical officer profile not found" }, { status: 404 })
    }

    const data = await req.json()

    // Create the medical record
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: medicalOfficer.id,
        recordType: data.recordType,
        title: data.title,
        summary: data.summary,
        details: data.details,
        relatedItems: data.relatedItems?.length ? JSON.stringify(data.relatedItems) : null,
      },
    })

    return NextResponse.json({
      id: record.id,
      status: "success",
      message: "Medical record created successfully",
    })
  } catch (error) {
    console.error("Error creating medical record:", error)
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 })
  }
}

