import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const session = await getServerSession(authOptions)

    // Check authentication and authorization
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to access their own profile or admins to access any profile
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If the user is a donor, get donor-specific info
    let donorData = null
    if (user.role === "DONOR") {
      const donor = await prisma.donor.findUnique({
        where: { userId },
        select: {
          id: true,
          bloodType: true,
          gender: true,
          dateOfBirth: true,
          weight: true,
          height: true,
          medicalHistory: true,
          donations: {
            where: { status: "COMPLETED" },
            orderBy: { actualDate: "desc" },
            take: 1,
            select: {
              actualDate: true,
            },
          },
        },
      })

      if (donor) {
        // Calculate next eligible date (56 days after last donation)
        let lastDonation = null
        let eligibleDate = null

        if (donor.donations.length > 0 && donor.donations[0].actualDate) {
          lastDonation = donor.donations[0].actualDate.toISOString()
          const eligibleDateTime = new Date(donor.donations[0].actualDate)
          eligibleDateTime.setDate(eligibleDateTime.getDate() + 56)
          eligibleDate = eligibleDateTime.toISOString()
        }

        // Count total donations
        const totalDonations = await prisma.donation.count({
          where: {
            donorId: donor.id,
            status: "COMPLETED",
          },
        })

        donorData = {
          bloodType: donor.bloodType,
          gender: donor.gender,
          dateOfBirth: donor.dateOfBirth,
          weight: donor.weight,
          height: donor.height,
          medicalHistory: donor.medicalHistory,
          lastDonation,
          eligibleDate,
          totalDonations,
        }
      }
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      phoneNumber: user.phoneNumber,
      address: user.address,
      donor: donorData,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const session = await getServerSession(authOptions)

    // Check authentication and authorization
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to update their own profile or admins to update any profile
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await req.json()

    // Update user data
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
      },
    })

    // If donor data is provided and user is a donor, update donor info
    if (data.donor && session.user.role === "DONOR") {
      const donor = await prisma.donor.findUnique({
        where: { userId },
      })

      if (donor) {
        await prisma.donor.update({
          where: { id: donor.id },
          data: {
            gender: data.donor.gender,
            dateOfBirth: data.donor.dateOfBirth ? new Date(data.donor.dateOfBirth) : undefined,
            weight: data.donor.weight,
            height: data.donor.height,
            medicalHistory: data.donor.medicalHistory,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}

