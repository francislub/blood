import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { hash, compare } from "bcryptjs"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const session = await getServerSession(authOptions)

    // Check authentication and authorization
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to change their own password
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, user.password as string)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password and update
    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}

