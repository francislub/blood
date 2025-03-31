import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { testResults, status, rejectionReason } = await req.json()

    // Validate donation exists
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Update donation with test results
    const updatedDonation = await prisma.donation.update({
      where: { id: params.id },
      data: {
        status,
        testResults,
        rejectionReason,
        testedBy: session.user.id,
        testedAt: new Date(),
      },
    })

    return NextResponse.json(updatedDonation)
  } catch (error) {
    console.error("Error testing donation:", error)
    return NextResponse.json({ error: "Failed to process donation test" }, { status: 500 })
  }
}

