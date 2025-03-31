import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inspectionResults, status } = await req.json()

    // Validate blood unit exists
    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: params.id },
    })

    if (!bloodUnit) {
      return NextResponse.json({ error: "Blood unit not found" }, { status: 404 })
    }

    // Update blood unit with quality control results
    const updatedBloodUnit = await prisma.bloodUnit.update({
      where: { id: params.id },
      data: {
        status,
        qualityControlResults: inspectionResults,
        qualityControlNotes: inspectionResults.notes,
        qualityControlBy: session.user.id,
        qualityControlAt: new Date(),
      },
    })

    return NextResponse.json(updatedBloodUnit)
  } catch (error) {
    console.error("Error performing quality control:", error)
    return NextResponse.json({ error: "Failed to perform quality control" }, { status: 500 })
  }
}

