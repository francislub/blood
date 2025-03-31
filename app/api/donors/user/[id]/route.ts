import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to access their own donor profile or admins/medical officers/technicians
    if (
      session.user.id !== params.id &&
      !["ADMIN", "MEDICAL_OFFICER", "BLOOD_BANK_TECHNICIAN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const donor = await prisma.donor.findFirst({
      where: { userId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        donations: {
          orderBy: {
            date: "desc",
          },
          take: 5,
        },
      },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json(donor)
  } catch (error) {
    console.error("Error fetching donor:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch donor" }, { status: 500 })
  }
}

