import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// Create a new patient
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins and medical officers can create patients
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MEDICAL_OFFICER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, hospitalId, dateOfBirth, gender, bloodType, contactNumber, address } = await req.json()

    // Check if patient with hospital ID already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { hospitalId },
    })

    if (existingPatient) {
      return NextResponse.json({ error: "Patient with this hospital ID already exists" }, { status: 400 })
    }

    // Get medical officer ID if the user is a medical officer
    let medicalOfficerId = null
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer) {
        medicalOfficerId = medicalOfficer.id
      }
    }

    // Create the patient
    const patient = await prisma.patient.create({
      data: {
        name,
        hospitalId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        bloodType,
        contactNumber,
        address,
        medicalOfficerId,
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    // Fix the error handling to avoid null payload
    console.error("Error creating patient:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}

// Get all patients
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can access patients
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const bloodType = url.searchParams.get("bloodType")
    const search = url.searchParams.get("search")

    // Build the query
    const where: any = {}

    if (bloodType) {
      where.bloodType = bloodType
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { hospitalId: { contains: search, mode: "insensitive" } },
      ]
    }

    // If medical officer, only show their patients
    if (session.user.role === "MEDICAL_OFFICER") {
      const medicalOfficer = await prisma.medicalOfficer.findUnique({
        where: { userId: session.user.id },
      })

      if (medicalOfficer) {
        where.medicalOfficerId = medicalOfficer.id
      }
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        medicalOfficer: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        transfusions: {
          take: 5,
          orderBy: {
            transfusionDate: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    // Fix the error handling to avoid null payload
    console.error("Error fetching patients:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

