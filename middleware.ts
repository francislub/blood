import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path starts with /dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // If no token, redirect to sign in
    if (!token) {
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // Role-based access control
    const userRole = token.role as string

    // Admin can access everything
    if (userRole === "ADMIN") {
      return NextResponse.next()
    }

    // Donor specific routes
    if (userRole === "DONOR") {
      const allowedPaths = [
        "/dashboard",
        "/dashboard/profile",
        "/dashboard/settings",
        "/dashboard/donation-history",
        "/dashboard/schedule",
        "/dashboard/certificates",
        "/dashboard/health-records",
      ]

      // Check if the current path is allowed for donors
      const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Medical Officer specific routes
    if (userRole === "MEDICAL_OFFICER") {
      const allowedPaths = [
        "/dashboard",
        "/dashboard/profile",
        "/dashboard/settings",
        "/dashboard/patients",
        "/dashboard/requests",
        "/dashboard/transfusions",
        "/dashboard/medical-records",
        "/dashboard/donor-screening",
      ]

      // Check if the current path is allowed for medical officers
      const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Blood Bank Technician specific routes
    if (userRole === "BLOOD_BANK_TECHNICIAN") {
      const allowedPaths = [
        "/dashboard",
        "/dashboard/profile",
        "/dashboard/settings",
        "/dashboard/inventory",
        "/dashboard/donations",
        "/dashboard/blood-testing",
        "/dashboard/component-separation",
        "/dashboard/quality-control",
      ]

      // Check if the current path is allowed for technicians
      const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

