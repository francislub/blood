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

    // For donor role, get stats for their donations
    if (session.user.role === "DONOR") {
      const donor = await prisma.donor.findUnique({
        where: { userId: session.user.id },
        include: {
          donations: {
            where: { status: "COMPLETED" },
            orderBy: { actualDate: "desc" },
            take: 1,
          },
        },
      })

      if (!donor) {
        return NextResponse.json({ error: "Donor profile not found" }, { status: 404 })
      }

      // Count total completed donations
      const totalDonations = await prisma.donation.count({
        where: {
          donorId: donor.id,
          status: "COMPLETED",
        },
      })

      // Calculate total volume donated
      const totalVolumeResult = await prisma.bloodUnit.aggregate({
        where: {
          donation: {
            donorId: donor.id,
            status: "COMPLETED",
          },
        },
        _sum: {
          volume: true,
        },
      })

      const totalVolume = totalVolumeResult._sum.volume || 0

      // Calculate last donation date and next eligible date
      let lastDonation = null
      let nextEligibleDate = null

      if (donor.donations.length > 0 && donor.donations[0].actualDate) {
        lastDonation = donor.donations[0].actualDate.toISOString()

        const eligibleDate = new Date(donor.donations[0].actualDate)
        eligibleDate.setDate(eligibleDate.getDate() + 56) // 56 days = 8 weeks

        // Only set next eligible date if it's in the future
        if (eligibleDate > new Date()) {
          nextEligibleDate = eligibleDate.toISOString()
        }
      }

      return NextResponse.json({
        totalDonations,
        totalVolume,
        lastDonation,
        nextEligibleDate,
      })
    }

    // For admin and medical staff, get global stats
    const totalDonations = await prisma.donation.count({
      where: { status: "COMPLETED" },
    })

    const totalVolumeResult = await prisma.bloodUnit.aggregate({
      where: {
        donation: {
          status: "COMPLETED",
        },
      },
      _sum: {
        volume: true,
      },
    })

    const totalVolume = totalVolumeResult._sum.volume || 0

    // Get latest donation date
    const latestDonation = await prisma.donation.findFirst({
      where: { status: "COMPLETED" },
      orderBy: { actualDate: "desc" },
      select: { actualDate: true },
    })

    return NextResponse.json({
      totalDonations,
      totalVolume,
      lastDonation: latestDonation?.actualDate?.toISOString() || null,
      nextEligibleDate: null,
    })
  } catch (error) {
    console.error("Error fetching donation stats:", error)
    return NextResponse.json({ error: "Failed to fetch donation statistics" }, { status: 500 })
  }
}

