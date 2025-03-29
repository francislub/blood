"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Droplet,
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  Calendar,
  History,
  User,
  LogOut,
  Menu,
  FlaskRoundIcon as Flask,
  Activity,
  VolumeIcon as Vial,
  HeartPulse,
  ClipboardList,
  Layers,
  ShieldCheck,
} from "lucide-react"

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const userRole = session?.user?.role || "DONOR"

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <Droplet className="h-6 w-6 text-red-500" />
        <span className="text-lg font-bold">Blood Bank</span>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />

          {/* Admin Links */}
          {userRole === "ADMIN" && (
            <>
              <SidebarLink href="/dashboard/users" icon={<Users size={18} />} label="Users" />
              <SidebarLink href="/dashboard/reports" icon={<FileBarChart size={18} />} label="Reports" />
              <SidebarLink href="/dashboard/inventory" icon={<Flask size={18} />} label="Inventory" />
              <SidebarLink href="/dashboard/donations" icon={<Droplet size={18} />} label="Donations" />
              <SidebarLink href="/dashboard/requests" icon={<Activity size={18} />} label="Requests" />
              <SidebarLink href="/dashboard/transfusions" icon={<HeartPulse size={18} />} label="Transfusions" />
              <SidebarLink href="/dashboard/patients" icon={<ClipboardList size={18} />} label="Patients" />
            </>
          )}

          {/* Donor Links */}
          {userRole === "DONOR" && (
            <>
              <SidebarLink href="/dashboard/donation-history" icon={<History size={18} />} label="Donation History" />
              <SidebarLink href="/dashboard/schedule" icon={<Calendar size={18} />} label="Schedule Donation" />
              <SidebarLink href="/dashboard/certificates" icon={<FileBarChart size={18} />} label="Certificates" />
              <SidebarLink href="/dashboard/health-records" icon={<ClipboardList size={18} />} label="Health Records" />
            </>
          )}

          {/* Medical Officer Links */}
          {userRole === "MEDICAL_OFFICER" && (
            <>
              <SidebarLink href="/dashboard/patients" icon={<ClipboardList size={18} />} label="Patients" />
              <SidebarLink href="/dashboard/requests" icon={<Activity size={18} />} label="Blood Requests" />
              <SidebarLink href="/dashboard/transfusions" icon={<HeartPulse size={18} />} label="Transfusions" />
              <SidebarLink
                href="/dashboard/medical-records"
                icon={<FileBarChart size={18} />}
                label="Medical Records"
              />
              <SidebarLink href="/dashboard/donor-screening" icon={<ShieldCheck size={18} />} label="Donor Screening" />
            </>
          )}

          {/* Blood Bank Technician Links */}
          {userRole === "BLOOD_BANK_TECHNICIAN" && (
            <>
              <SidebarLink href="/dashboard/inventory" icon={<Flask size={18} />} label="Inventory" />
              <SidebarLink href="/dashboard/donations" icon={<Droplet size={18} />} label="Donations" />
              <SidebarLink href="/dashboard/blood-testing" icon={<Vial size={18} />} label="Blood Testing" />
              <SidebarLink
                href="/dashboard/component-separation"
                icon={<Layers size={18} />}
                label="Component Separation"
              />
              <SidebarLink href="/dashboard/quality-control" icon={<ShieldCheck size={18} />} label="Quality Control" />
            </>
          )}

          {/* Common Links */}
          <SidebarLink href="/dashboard/profile" icon={<User size={18} />} label="Profile" />
          <SidebarLink href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden w-64 flex-shrink-0 border-r bg-white dark:bg-gray-950 dark:border-gray-800 md:block">
          {sidebarContent}
        </div>
      )}
    </>
  )
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

