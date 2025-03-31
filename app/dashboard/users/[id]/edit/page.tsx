"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import UserForm from "@/components/forms/user-form"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Only admins can edit users
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error: any) {
        setError(error.message || "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchUser()
    }
  }, [params, session, status, router])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-lg text-red-500">{error}</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Go Back
        </button>
      </div>
    )
  }

  if (status === "authenticated" && session?.user?.role === "ADMIN" && user) {
    // Transform user data to match form structure
    const formData = {
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      // Add role-specific data
      ...(user.donor && { donor: user.donor }),
      ...(user.medicalOfficer && { medicalOfficer: user.medicalOfficer }),
      ...(user.technician && { technician: user.technician }),
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        </div>
        <UserForm initialData={formData} userId={params.id} isEditMode={true} />
      </div>
    )
  }

  return null
}

