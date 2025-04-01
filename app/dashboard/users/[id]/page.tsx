"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash, User, Mail, Phone, Calendar, Shield, Clock, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id, toast])

  const handleDeleteUser = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })
      router.push("/dashboard/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center">
            <p className="text-muted-foreground">User not found</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/users")}>
              Return to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/users/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">{user.name}</CardTitle>
            <CardDescription className="text-center">
              <Badge className="mx-auto mt-1">{formatRole(user.role)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Role: {formatRole(user.role)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Last active: {formatDate(user.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                      <dd className="mt-1">{user.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                      <dd className="mt-1">{user.phoneNumber || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                      <dd className="mt-1">{formatRole(user.role)}</dd>
                    </div>
                  </dl>
                </div>

                {user.role === "DONOR" && user.donor && (
                  <div>
                    <h3 className="text-lg font-medium">Donor Information</h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Blood Type</dt>
                        <dd className="mt-1">
                          {user.donor.bloodType.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Last Donation</dt>
                        <dd className="mt-1">
                          {user.donor.lastDonationDate ? formatDate(user.donor.lastDonationDate) : "Never donated"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Eligible to Donate</dt>
                        <dd className="mt-1">
                          {user.donor.eligibleToDonateSince && new Date(user.donor.eligibleToDonateSince) > new Date()
                            ? `From ${formatDate(user.donor.eligibleToDonateSince)}`
                            : "Yes"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Total Donations</dt>
                        <dd className="mt-1">{user.donor.donationCount || 0}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {user.role === "MEDICAL_OFFICER" && user.medicalOfficer && (
                  <div>
                    <h3 className="text-lg font-medium">Medical Officer Information</h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">License Number</dt>
                        <dd className="mt-1">{user.medicalOfficer.licenseNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Specialization</dt>
                        <dd className="mt-1">{user.medicalOfficer.specialization}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="activity" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  <Separator className="my-2" />
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Last login: {formatDate(user.updatedAt)}</span>
                    </div>
                    {/* Add more activity items here */}
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      Detailed activity log will be available in future updates.
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">User Permissions</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">{formatRole(user.role)}</p>
                      </div>
                      <Badge>{formatRole(user.role)}</Badge>
                    </div>
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      Detailed permission management will be available in future updates.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button asChild>
              <Link href={`/dashboard/users/${params.id}/edit`}>Edit User</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

