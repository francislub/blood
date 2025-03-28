import type React from "react"
import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"

export const metadata: Metadata = {
  title: "Dashboard | Nyamagana Blood Bank",
  description: "Blood Bank Management System for Nyamagana District Hospital",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}

