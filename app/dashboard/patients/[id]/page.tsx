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
  Calendar,
  Droplet,
  Activity,
  Phone,
  MapPin,
  Heart,
  Clipboard,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [patient, setPatient] = useState<any>(null)
  const [transfusions, setTransfusions] = useState<any[]>([])
  const [bloodRequests, setBloodRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch patient")
        }
        const data = await response.json()
        setPatient(data)

        // Fetch patient's transfusions
        const transfusionsResponse = await fetch(`/api/transfusions?patientId=${params.id}`)
        if (transfusionsResponse.ok) {
          const transfusionsData = await transfusionsResponse.json()
          setTransfusions(transfusionsData)
        }

        // Fetch patient's blood requests
        const requestsResponse = await fetch(`/api/blood-requests?patientId=${params.id}`)
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setBloodRequests(requestsData)
        }
      } catch (error) {
        console.error("Error fetching patient:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [params.id, toast])

  const handleDeletePatient = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/patients/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete patient")
      }

      toast({
        title: "Patient deleted",
        description: "The patient has been deleted successfully.",
      })
      router.push("/dashboard/patients")
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center">
            <p className="text-muted-foreground">Patient not found</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/patients")}>
              Return to Patients
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
            <Link href={`/dashboard/patients/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/requests/new?patientId=${params.id}`}>
              <Droplet className="mr-2 h-4 w-4" />
              Request Blood
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
                  This action cannot be undone. This will permanently delete the patient record and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePatient}
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
            <CardTitle className="text-center">{patient.name}</CardTitle>
            <CardDescription className="text-center">
              <Badge className="mx-auto mt-1" variant="outline">
                {formatBloodType(patient.bloodType)}
              </Badge>
              <div className="mt-1 text-sm">{patient.hospitalId && `ID: ${patient.hospitalId}`}</div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Age: {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "Unknown"} years</span>
              </div>
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Gender: {patient.gender}</span>
              </div>
              <div className="flex items-center">
                <Droplet className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Blood Type: {formatBloodType(patient.bloodType)}</span>
              </div>
              {patient.contactNumber && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{patient.contactNumber}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{patient.address}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Admitted: {formatDate(patient.admissionDate)}</span>
              </div>
              {patient.dischargeDate && (
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Discharged: {formatDate(patient.dischargeDate)}</span>
                </div>
              )}
              <div className="flex items-center">
                <Badge variant={patient.status === "ADMITTED" ? "default" : "secondary"}>{patient.status}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/dashboard/requests/new?patientId=${params.id}`}>Request Blood</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="medical">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="medical">Medical Info</TabsTrigger>
                <TabsTrigger value="transfusions">Transfusions</TabsTrigger>
                <TabsTrigger value="requests">Blood Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="medical" className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Medical Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Diagnosis</dt>
                      <dd className="mt-1">{patient.diagnosis}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Attending Doctor</dt>
                      <dd className="mt-1">{patient.doctor || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Blood Type</dt>
                      <dd className="mt-1">{formatBloodType(patient.bloodType)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd className="mt-1">
                        <Badge variant={patient.status === "ADMITTED" ? "default" : "secondary"}>
                          {patient.status}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Vital Signs</h3>
                  <Separator className="my-2" />
                  {patient.vitalSigns ? (
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Blood Pressure</dt>
                        <dd className="mt-1 flex items-center">
                          <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                          {patient.vitalSigns.bloodPressure || "Not recorded"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Heart Rate</dt>
                        <dd className="mt-1 flex items-center">
                          <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                          {patient.vitalSigns.heartRate ? `${patient.vitalSigns.heartRate} bpm` : "Not recorded"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Temperature</dt>
                        <dd className="mt-1 flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                          {patient.vitalSigns.temperature ? `${patient.vitalSigns.temperature}°C` : "Not recorded"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Respiratory Rate</dt>
                        <dd className="mt-1 flex items-center">
                          <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                          {patient.vitalSigns.respiratoryRate
                            ? `${patient.vitalSigns.respiratoryRate} breaths/min`
                            : "Not recorded"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      No vital signs recorded for this patient.
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Medical History</h3>
                  <Separator className="my-2" />
                  <div className="rounded-md border p-4">
                    {patient.medicalHistory ? (
                      <p>{patient.medicalHistory}</p>
                    ) : (
                      <p className="text-muted-foreground">No medical history recorded.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Allergies</h3>
                  <Separator className="my-2" />
                  <div className="rounded-md border p-4">
                    {patient.allergies ? (
                      <p>{patient.allergies}</p>
                    ) : (
                      <p className="text-muted-foreground">No allergies recorded.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transfusions" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Transfusion History</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/patients/${params.id}/history`}>View All</Link>
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  {transfusions.length === 0 ? (
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      No transfusion records found for this patient.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transfusions.map((transfusion) => (
                        <div key={transfusion.id} className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatDate(transfusion.transfusionDate)}</span>
                            </div>
                            <Badge>{transfusion.status}</Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Units:</span>{" "}
                              {transfusion.bloodUnits?.length || 0}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Blood Type:</span>{" "}
                              {formatBloodType(patient.bloodType)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Performed By:</span>{" "}
                              {transfusion.performedBy || "Unknown"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Department:</span>{" "}
                              {transfusion.department || "Unknown"}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/transfusions/${transfusion.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="requests" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Blood Requests</h3>
                    <Button asChild>
                      <Link href={`/dashboard/requests/new?patientId=${params.id}`}>
                        <Droplet className="mr-2 h-4 w-4" />
                        New Request
                      </Link>
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  {bloodRequests.length === 0 ? (
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                      No blood requests found for this patient.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bloodRequests.map((request) => (
                        <div key={request.id} className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clipboard className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Request #{request.id.substring(0, 8)}</span>
                            </div>
                            <Badge
                              variant={
                                request.status === "PENDING"
                                  ? "outline"
                                  : request.status === "APPROVED"
                                    ? "success"
                                    : request.status === "FULFILLED"
                                      ? "default"
                                      : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Blood Type:</span>{" "}
                              {formatBloodType(request.bloodType)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantity:</span> {request.quantity} units
                            </div>
                            <div>
                              <span className="text-muted-foreground">Urgency:</span> {request.urgency}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Requested:</span> {formatDate(request.createdAt)}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/requests/${request.id}`}>View Request</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button asChild>
              <Link href={`/dashboard/patients/${params.id}/edit`}>Edit Patient</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

