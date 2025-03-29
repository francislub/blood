import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Users can only access their own data unless they're an admin
    if (!session || (session.user.id !== params.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        donor: true,
        medicalOfficer: true,
        technician: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// Update a user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Users can only update their own data unless they're an admin
    if (!session || (session.user.id !== params.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, phoneNumber, address, ...roleSpecificData } = await req.json()

    // Start a transaction to update user and role-specific data
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Get current user to check role
      const currentUser = await tx.user.findUnique({
        where: { id: params.id },
        include: {
          donor: true,
          medicalOfficer: true,
          technician: true,
        },
      })

      if (!currentUser) {
        throw new Error("User not found")
      }

      // Update base user data
      const userData: any = {
        name,
        email,
        phoneNumber,
        address,
      }

      // Only hash and update password if provided
      if (password) {
        userData.password = await hash(password, 10)
      }

      const user = await tx.user.update({
        where: { id: params.id },
        data: userData,
      })

      // Update role-specific data
      if (currentUser.role === "DONOR" && roleSpecificData.donor) {
        if (currentUser.donor) {
          await tx.donor.update({
            where: { userId: params.id },
            data: {
              bloodType: roleSpecificData.donor.bloodType,
              dateOfBirth: new Date(roleSpecificData.donor.dateOfBirth),
              gender: roleSpecificData.donor.gender,
              weight: roleSpecificData.donor.weight,
              height: roleSpecificData.donor.height,
              medicalHistory: roleSpecificData.donor.medicalHistory,
            },
          })
        } else {
          await tx.donor.create({
            data: {
              userId: params.id,
              bloodType: roleSpecificData.donor.bloodType,
              dateOfBirth: new Date(roleSpecificData.donor.dateOfBirth),
              gender: roleSpecificData.donor.gender,
              weight: roleSpecificData.donor.weight,
              height: roleSpecificData.donor.height,
              medicalHistory: roleSpecificData.donor.medicalHistory,
            },
          })
        }
      } else if (currentUser.role === "MEDICAL_OFFICER" && roleSpecificData.medicalOfficer) {
        if (currentUser.medicalOfficer) {
          await tx.medicalOfficer.update({
            where: { userId: params.id },
            data: {
              licenseNumber: roleSpecificData.medicalOfficer.licenseNumber,
              department: roleSpecificData.medicalOfficer.department,
              position: roleSpecificData.medicalOfficer.position,
            },
          })
        } else {
          await tx.medicalOfficer.create({
            data: {
              userId: params.id,
              licenseNumber: roleSpecificData.medicalOfficer.licenseNumber,
              department: roleSpecificData.medicalOfficer.department,
              position: roleSpecificData.medicalOfficer.position,
            },
          })
        }
      } else if (currentUser.role === "BLOOD_BANK_TECHNICIAN" && roleSpecificData.technician) {
        if (currentUser.technician) {
          await tx.bloodBankTechnician.update({
            where: { userId: params.id },
            data: {
              employeeId: roleSpecificData.technician.employeeId,
              specialization: roleSpecificData.technician.specialization,
            },
          })
        } else {
          await tx.bloodBankTechnician.create({
            data: {
              userId: params.id,
              employeeId: roleSpecificData.technician.employeeId,
              specialization: roleSpecificData.technician.specialization,
            },
          })
        }
      }

      return user
    })

    // Return the updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Delete a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can delete users
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

