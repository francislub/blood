import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// Create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can create users (except for donor self-registration)
    if (!session && req.body.role !== "DONOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session?.user.role !== "ADMIN" && req.body.role !== "DONOR") {
      return NextResponse.json({ error: "Only admins can create non-donor users" }, { status: 403 })
    }

    const { name, email, password, role, phoneNumber, address, ...roleSpecificData } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user transaction with role-specific data
    const user = await prisma.$transaction(async (tx) => {
      // Create base user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phoneNumber,
          address,
        },
      })

      // Create role-specific profile
      if (role === "DONOR" && roleSpecificData.donor) {
        await tx.donor.create({
          data: {
            userId: newUser.id,
            bloodType: roleSpecificData.donor.bloodType,
            dateOfBirth: new Date(roleSpecificData.donor.dateOfBirth),
            gender: roleSpecificData.donor.gender,
            weight: roleSpecificData.donor.weight,
            height: roleSpecificData.donor.height,
            medicalHistory: roleSpecificData.donor.medicalHistory,
          },
        })
      } else if (role === "MEDICAL_OFFICER" && roleSpecificData.medicalOfficer) {
        await tx.medicalOfficer.create({
          data: {
            userId: newUser.id,
            licenseNumber: roleSpecificData.medicalOfficer.licenseNumber,
            department: roleSpecificData.medicalOfficer.department,
            position: roleSpecificData.medicalOfficer.position,
          },
        })
      } else if (role === "BLOOD_BANK_TECHNICIAN" && roleSpecificData.technician) {
        await tx.bloodBankTechnician.create({
          data: {
            userId: newUser.id,
            employeeId: roleSpecificData.technician.employeeId,
            specialization: roleSpecificData.technician.specialization,
          },
        })
      }

      return newUser
    })

    // Return the created user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

// Get all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

