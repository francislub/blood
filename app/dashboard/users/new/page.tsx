"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import UserForm from "@/components/forms/user-form"

export default function NewUserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only admins can create users
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (status === "authenticated" && session?.user?.role === "ADMIN") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        </div>
        <UserForm />
      </div>
    )
  }

  return null
}

