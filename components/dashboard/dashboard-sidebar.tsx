"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  HeartPulse,
  FlaskRoundIcon as Flask,
  Droplet,
  Activity,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  FileText,
  Calendar,
  Award,
  CheckSquare,
  Microscope,
  Layers,
  ShieldCheck,
  Menu,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)

  // Check if the screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Define navigation items based on user role
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

  // Determine which items to show based on user role
  let roleItems = []
  if (session?.user?.role === "ADMIN") {
    roleItems = adminItems
  } else if (session?.user?.role === "DONOR") {
    roleItems = donorItems
  } else if (session?.user?.role === "MEDICAL_OFFICER") {
    roleItems = medicalOfficerItems
  } else if (session?.user?.role === "TECHNICIAN") {
    roleItems = technicianItems
  }

  const items = [...commonItems, ...roleItems]

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Blood Bank Management</h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", pathname === item.href ? "bg-secondary" : "hover:bg-muted")}
                asChild
                onClick={() => isMobile && setOpen(false)}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // For mobile, use a sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  // For desktop, render the sidebar directly
  return (
    <div className="hidden md:block">
      <div className="fixed top-0 z-30 h-screen w-64 border-r bg-background pt-16">
        <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
      </div>
    </div>
  )
}

