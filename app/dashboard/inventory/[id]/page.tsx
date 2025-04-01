"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  Calendar,
  Droplet,
  AlertTriangle,
  FlaskRoundIcon as Flask,
  Clock,
  CheckCircle,
  XCircle,
  Beaker,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BloodUnitDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [bloodUnit, setBloodUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchBloodUnit = async () => {
      try {
        const response = await fetch(`/api/blood-units/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch blood unit")
        }
        const data = await response.json()
        setBloodUnit(data)
      } catch (error) {
        console.error("Error fetching blood unit:", error)
        toast({
          title: "Error",
          description: "Failed to load blood unit data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBloodUnit()
  }, [params.id, toast])

  const handleDeleteBloodUnit = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/blood-units/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blood unit")
      }

      toast({
        title: "Blood unit deleted",
        description: "The blood unit has been deleted successfully.",
      })
      router.push("/dashboard/inventory")
    } catch (error) {
      console.error("Error deleting blood unit:", error)
      toast({
        title: "Error",
        description: "Failed to delete blood unit. Please try again.",
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

  // Get days left until expiry
  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    // Reset hours to avoid time zone issues
    expiry.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Check if blood unit is expiring soon (within 7 days)
  const isExpiringSoon = (unit: any) => {
    if (unit.status !== "AVAILABLE") return false
    const daysLeft = getDaysLeft(unit.expiryDate)
    return daysLeft <= 7 && daysLeft > 0
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success"
      case "RESERVED":
        return "warning"
      case "USED":
        return "default"
      case "EXPIRED":
        return "destructive"
      case "DISCARDED":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!bloodUnit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center">
            <p className="text-muted-foreground">Blood unit not found</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/inventory")}>
              Return to Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysLeft = getDaysLeft(bloodUnit.expiryDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/inventory/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {bloodUnit.status === "AVAILABLE" && (
            <Button asChild>
              <Link href={`/dashboard/inventory/${params.id}/allocate`}>
                <Droplet className="mr-2 h-4 w-4" />
                Allocate
              </Link>
            </Button>
          )}
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
                  This action cannot be undone. This will permanently delete the blood unit record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBloodUnit}
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
                <Flask className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">{bloodUnit.unitNumber}</CardTitle>
            <CardDescription className="text-center">
              <Badge className="mx-auto mt-1" variant={getStatusBadgeVariant(bloodUnit.status)}>
                {bloodUnit.status}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Droplet className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  Blood Type: <Badge variant="outline">{formatBloodType(bloodUnit.bloodType)}</Badge>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Collection: {formatDate(bloodUnit.collectionDate)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Expiry: {formatDate(bloodUnit.expiryDate)}</span>
              </div>
              {bloodUnit.status === "AVAILABLE" && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {daysLeft > 0 ? (
                    <span className={daysLeft <= 7 ? "text-amber-500" : ""}>
                      {daysLeft} days until expiry
                      {isExpiringSoon(bloodUnit) && <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />}
                    </span>
                  ) : (
                    <span className="text-red-500">Expired</span>
                  )}
                </div>
              )}
              <div className="flex items-center">
                <Beaker className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Volume: {bloodUnit.volume} ml</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {bloodUnit.status === "AVAILABLE" && (
              <Button className="w-full" asChild>
                <Link href={`/dashboard/inventory/${params.id}/allocate`}>Allocate Blood Unit</Link>
              </Button>
            )}
            {bloodUnit.status !== "AVAILABLE" && (
              <Button className="w-full" variant="outline" disabled>
                {bloodUnit.status === "USED"
                  ? "Unit Used"
                  : bloodUnit.status === "RESERVED"
                    ? "Unit Reserved"
                    : "Unit Not Available"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Blood Unit Details</CardTitle>
            <CardDescription>Detailed information about blood unit {bloodUnit.unitNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Unit Information</h3>
              <Separator className="my-2" />
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Unit Number</dt>
                  <dd className="mt-1">{bloodUnit.unitNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Blood Type</dt>
                  <dd className="mt-1">{formatBloodType(bloodUnit.bloodType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={getStatusBadgeVariant(bloodUnit.status)}>{bloodUnit.status}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Volume</dt>
                  <dd className="mt-1">{bloodUnit.volume} ml</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Collection Date</dt>
                  <dd className="mt-1">{formatDate(bloodUnit.collectionDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Expiry Date</dt>
                  <dd className="mt-1">{formatDate(bloodUnit.expiryDate)}</dd>
                </div>
              </dl>
            </div>

            {bloodUnit.donation && (
              <div>
                <h3 className="text-lg font-medium">Donation Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Donation ID</dt>
                    <dd className="mt-1">
                      <Link
                        href={`/dashboard/donations/${bloodUnit.donationId}`}
                        className="text-primary hover:underline"
                      >
                        {bloodUnit.donationId}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Donation Date</dt>
                    <dd className="mt-1">{formatDate(bloodUnit.donation.donationDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Donation Type</dt>
                    <dd className="mt-1">{bloodUnit.donation.donationType.replace("_", " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Donor</dt>
                    <dd className="mt-1">
                      {bloodUnit.donation.donor && (
                        <Link
                          href={`/dashboard/donors/${bloodUnit.donation.donor.id}`}
                          className="text-primary hover:underline"
                        >
                          {bloodUnit.donation.donor.user.name}
                        </Link>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">Quality Control</h3>
              <Separator className="my-2" />
              {bloodUnit.qualityControl ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tested On</dt>
                    <dd className="mt-1">{formatDate(bloodUnit.qualityControl.testedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tested By</dt>
                    <dd className="mt-1">{bloodUnit.qualityControl.testedBy}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Result</dt>
                    <dd className="mt-1">
                      {bloodUnit.qualityControl.passed ? (
                        <span className="flex items-center text-green-500">
                          <CheckCircle className="mr-1 h-4 w-4" /> Passed
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500">
                          <XCircle className="mr-1 h-4 w-4" /> Failed
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd className="mt-1">{bloodUnit.qualityControl.notes || "No notes"}</dd>
                  </div>
                </dl>
              ) : (
                <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                  No quality control tests recorded for this unit.
                </div>
              )}
            </div>

            {bloodUnit.status === "USED" && bloodUnit.transfusion && (
              <div>
                <h3 className="text-lg font-medium">Transfusion Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Transfusion ID</dt>
                    <dd className="mt-1">
                      <Link
                        href={`/dashboard/transfusions/${bloodUnit.transfusion.id}`}
                        className="text-primary hover:underline"
                      >
                        {bloodUnit.transfusion.id}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Transfusion Date</dt>
                    <dd className="mt-1">{formatDate(bloodUnit.transfusion.transfusionDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Patient</dt>
                    <dd className="mt-1">
                      {bloodUnit.transfusion.patient && (
                        <Link
                          href={`/dashboard/patients/${bloodUnit.transfusion.patient.id}`}
                          className="text-primary hover:underline"
                        >
                          {bloodUnit.transfusion.patient.name}
                        </Link>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Performed By</dt>
                    <dd className="mt-1">{bloodUnit.transfusion.performedBy}</dd>
                  </div>
                </dl>
              </div>
            )}

            {bloodUnit.status === "RESERVED" && bloodUnit.reservation && (
              <div>
                <h3 className="text-lg font-medium">Reservation Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Reserved For</dt>
                    <dd className="mt-1">
                      {bloodUnit.reservation.patient && (
                        <Link
                          href={`/dashboard/patients/${bloodUnit.reservation.patient.id}`}
                          className="text-primary hover:underline"
                        >
                          {bloodUnit.reservation.patient.name}
                        </Link>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Reserved On</dt>
                    <dd className="mt-1">{formatDate(bloodUnit.reservation.reservedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Reserved By</dt>
                    <dd className="mt-1">{bloodUnit.reservation.reservedBy}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd className="mt-1">{bloodUnit.reservation.notes || "No notes"}</dd>
                  </div>
                </dl>
              </div>
            )}

            {bloodUnit.status === "DISCARDED" && (
              <div>
                <h3 className="text-lg font-medium">Discard Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Discarded On</dt>
                    <dd className="mt-1">{bloodUnit.discardedAt ? formatDate(bloodUnit.discardedAt) : "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Reason</dt>
                    <dd className="mt-1">{bloodUnit.discardReason || "Not specified"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button asChild>
              <Link href={`/dashboard/inventory/${params.id}/edit`}>Edit Blood Unit</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

