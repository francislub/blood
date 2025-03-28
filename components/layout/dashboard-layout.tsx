"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import {
  Menu,
  Home,
  Users,
  Droplet,
  Calendar,
  FileText,
  Settings,
  User,
  LogOut,
  Activity,
  FlaskRoundIcon as Flask,
  HeartPulse,
  ClipboardList,
  BarChart3,
  Award,
  CheckSquare,
  Microscope,
  Layers,
  ShieldCheck,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [initials, setInitials] = useState("U")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (session?.user?.name) {
      const nameParts = session.user.name.split(" ")
      if (nameParts.length >= 2) {
        setInitials(`${nameParts[0][0]}${nameParts[1][0]}`)
      } else if (nameParts.length === 1) {
        setInitials(nameParts[0][0])
      }
    }
  }, [session, status, router])

  // Update the getNavigationItems function to ensure all roles have appropriate navigation items

  const getNavigationItems = () => {
    const role = session?.user?.role

    const commonItems = [{ name: "Dashboard", href: "/dashboard", icon: Home }]

    const adminItems = [
      { name: "Users", href: "/dashboard/users", icon: Users },
      { name: "Donors", href: "/dashboard/donors", icon: HeartPulse },
      { name: "Blood Inventory", href: "/dashboard/inventory", icon: Flask },
      { name: "Donations", href: "/dashboard/donations", icon: Droplet },
      { name: "Patients", href: "/dashboard/patients", icon: Activity },
      { name: "Blood Requests", href: "/dashboard/requests", icon: ClipboardList },
      { name: "Transfusions", href: "/dashboard/transfusions", icon: Activity },
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ]

    const donorItems = [
      { name: "My Profile", href: "/dashboard/profile", icon: User },
      { name: "Donation History", href: "/dashboard/donation-history", icon: FileText },
      { name: "Schedule Donation", href: "/dashboard/schedule", icon: Calendar },
      { name: "Health Records", href: "/dashboard/health-records", icon: Activity },
      { name: "Certificates", href: "/dashboard/certificates", icon: Award },
    ]

    const medicalOfficerItems = [
      { name: "Patients", href: "/dashboard/patients", icon: Activity },
      { name: "Blood Requests", href: "/dashboard/requests", icon: ClipboardList },
      { name: "Transfusions", href: "/dashboard/transfusions", icon: Droplet },
      { name: "Medical Records", href: "/dashboard/medical-records", icon: FileText },
      { name: "Donor Screening", href: "/dashboard/donor-screening", icon: CheckSquare },
    ]

    const technicianItems = [
      { name: "Blood Inventory", href: "/dashboard/inventory", icon: Flask },
      { name: "Donations", href: "/dashboard/donations", icon: Droplet },
      { name: "Donors", href: "/dashboard/donors", icon: HeartPulse },
      { name: "Blood Testing", href: "/dashboard/blood-testing", icon: Microscope },
      { name: "Component Separation", href: "/dashboard/component-separation", icon: Layers },
      { name: "Quality Control", href: "/dashboard/quality-control", icon: ShieldCheck },
    ]

    switch (role) {
      case "ADMIN":
        return [...commonItems, ...adminItems]
      case "DONOR":
        return [...commonItems, ...donorItems]
      case "MEDICAL_OFFICER":
        return [...commonItems, ...medicalOfficerItems]
      case "BLOOD_BANK_TECHNICIAN":
        return [...commonItems, ...technicianItems]
      default:
        return commonItems
    }
  }

  const navigationItems = getNavigationItems()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMobileOpen(false)}
              >
                <Droplet className="h-6 w-6 text-primary" />
                <span>Blood Bank</span>
              </Link>
              <div className="grid gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted ${
                      pathname === item.href ? "bg-muted" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="hidden md:inline-block">Nyamagana Blood Bank</span>
        </Link>
        <div className="flex-1"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted ${
                  pathname === item.href ? "bg-muted font-medium text-primary" : ""
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

