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
import {
  ArrowLeft,
  Edit,
  Trash,
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  Activity,
  Heart,
  Weight,
  Ruler,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DonorDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [donor, setDonor] = useState<any>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const response = await fetch(`/api/donors/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch donor")
        }
        const data = await response.json()
        setDonor(data)

        // Fetch donor's donations
        const donationsResponse = await fetch(`/api/donations?donorId=${params.id}`)
        if (donationsResponse.ok) {
          const donationsData = await donationsResponse.json()
          setDonations(donationsData)
        }
      } catch (error) {
        console.error("Error fetching donor:", error)
        toast({
          title: "Error",
          description: "Failed to load donor data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonor()
  }, [params.id, toast])

  const handleDeleteDonor = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/donors/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete donor")
      }

      toast({
        title: "Donor deleted",
        description: "The donor has been deleted successfully.",
      })
      router.push("/dashboard/donors")
    } catch (error) {
      console.error("Error deleting donor:", error)
      toast({
        title: "Error",
        description: "Failed to delete donor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Check if donor is eligible to donate
  const isEligible = (donor: any) => {
    if (!donor.eligibleToDonateSince) return true
    return new Date(donor.eligibleToDonateSince) <= new Date()
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!donor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center">
            <p className="text-muted-foreground">Donor not found</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/donors")}>
              Return to Donors
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
            <Link href={`/dashboard/donors/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/donations/schedule?donorId=${params.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Donation
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
                  This action cannot be undone. This will permanently delete the donor record and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDonor}
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
            <CardTitle className="text-center">{donor.user.name}</CardTitle>
            <CardDescription className="text-center">
              <Badge className="mx-auto mt-1" variant="outline">
                {formatBloodType(donor.bloodType)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{donor.user.email}</span>
              </div>
              {donor.user.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{donor.user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center">
                <Droplet className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Blood Type: {formatBloodType(donor.bloodType)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  Last Donation: {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "Never donated"}
                </span>
              </div>
              <div className="flex items-center">
                {isEligible(donor) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-500">Eligible to donate</span>
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">Eligible from {formatDate(donor.eligibleToDonateSince)}</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild disabled={!isEligible(donor)}>
              <Link href={`/dashboard/donations/schedule?donorId=${params.id}`}>Schedule Donation</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Donor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="health">Health Info</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                      <dd className="mt-1">{donor.user.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1">{donor.user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                      <dd className="mt-1">{donor.user.phoneNumber || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                      <dd className="mt-1">{donor.gender}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                      <dd className="mt-1">{donor.dateOfBirth ? formatDate(donor.dateOfBirth) : "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                      <dd className="mt-1">{donor.address || "Not provided"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Donation Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Blood Type</dt>
                      <dd className="mt-1">{formatBloodType(donor.bloodType)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Donations</dt>
                      <dd className="mt-1">{donor.donationCount || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Donation</dt>
                      <dd className="mt-1">
                        {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "Never donated"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Eligibility Status</dt>
                      <dd className="mt-1">
                        {isEligible(donor) ? (
                          <span className="text-green-500">Eligible to donate</span>
                        ) : (
                          <span className="text-amber-500">
                            Eligible from {formatDate(donor.eligibleToDonateSince)}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </TabsContent>
              <TabsContent value="donations" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Donation History</h3>
                  <Separator className="my-2" />
                  {donations.length === 0 ? (
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      No donation records found for this donor.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div key={donation.id} className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatDate(donation.donationDate)}</span>
                            </div>
                            <Badge>{donation.status}</Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Type:</span>{" "}
                              {donation.donationType.replace("_", " ")}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Volume:</span> {donation.volume}ml
                            </div>
                            <div>
                              <span className="text-muted-foreground">Hemoglobin:</span>{" "}
                              {donation.hemoglobinLevel || "N/A"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Blood Pressure:</span>{" "}
                              {donation.bloodPressure || "N/A"}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/donations/${donation.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="health" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Health Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                      <dd className="mt-1 flex items-center">
                        <Weight className="mr-2 h-4 w-4 text-muted-foreground" />
                        {donor.weight ? `${donor.weight} kg` : "Not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Height</dt>
                      <dd className="mt-1 flex items-center">
                        <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                        {donor.height ? `${donor.height} cm` : "Not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Blood Pressure</dt>
                      <dd className="mt-1 flex items-center">
                        <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                        {donor.lastBloodPressure || "Not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Hemoglobin Level</dt>
                      <dd className="mt-1 flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                        {donor.lastHemoglobinLevel ? `${donor.lastHemoglobinLevel} g/dL` : "Not recorded"}
                      </dd>
                    </div>
                  </dl>
                  <div>
                    <h4 className="text-md font-medium">Medical History</h4>
                    <div className="mt-2 rounded-md border p-4">
                      {donor.medicalHistory ? (
                        <p>{donor.medicalHistory}</p>
                      ) : (
                        <p className="text-muted-foreground">No medical history recorded.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium">Allergies</h4>
                    <div className="mt-2 rounded-md border p-4">
                      {donor.allergies ? (
                        <p>{donor.allergies}</p>
                      ) : (
                        <p className="text-muted-foreground">No allergies recorded.</p>
                      )}
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
              <Link href={`/dashboard/donors/${params.id}/edit`}>Edit Donor</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

