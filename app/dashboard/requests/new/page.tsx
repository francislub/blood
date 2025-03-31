"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Droplet, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NewBloodRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState([])
  const [bloodInventory, setBloodInventory] = useState({})
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [bloodType, setBloodType] = useState("")
  const [units, setUnits] = useState(1)
  const [urgency, setUrgency] = useState("NORMAL")
  const [requiredDate, setRequiredDate] = useState(new Date())
  const [reason, setReason] = useState("")

  // Fetch patients list
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Only medical officers and admins can create blood requests
    if (session.user.role !== "MEDICAL_OFFICER" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients")
        if (!response.ok) throw new Error("Failed to fetch patients")
        const data = await response.json()
        setPatients(data)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast({
          title: "Error",
          description: "Failed to load patients list",
          variant: "destructive",
        })
      }
    }

    const fetchBloodInventory = async () => {
      try {
        const response = await fetch("/api/blood-units/status")
        if (!response.ok) throw new Error("Failed to fetch blood inventory")
        const data = await response.json()
        setBloodInventory(data)
      } catch (error) {
        console.error("Error fetching blood inventory:", error)
        toast({
          title: "Error",
          description: "Failed to load blood inventory status",
          variant: "destructive",
        })
      }
    }

    fetchPatients()
    fetchBloodInventory()
  }, [session, status, router])

  // Fetch patient details when patient ID is selected
  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null)
      return
    }

    const fetchPatientDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/patients/${selectedPatientId}`)
        if (!response.ok) throw new Error("Failed to fetch patient details")
        const data = await response.json()
        setSelectedPatient(data)

        // Auto-select patient's blood type if available
        if (data.bloodType) {
          setBloodType(data.bloodType)
        }
      } catch (error) {
        console.error("Error fetching patient details:", error)
        toast({
          title: "Error",
          description: "Failed to load patient details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientDetails()
  }, [selectedPatientId])

  // Format blood type for display
  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Check if there's enough blood in inventory
  const isBloodAvailable = (type, requestedUnits) => {
    if (!type || !bloodInventory[type]) return false
    return bloodInventory[type] >= requestedUnits
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (!bloodType) {
      toast({
        title: "Error",
        description: "Please select a blood type",
        variant: "destructive",
      })
      return
    }

    if (!requiredDate) {
      toast({
        title: "Error",
        description: "Please select a required date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          bloodType,
          units: Number(units),
          urgency,
          requiredDate: requiredDate.toISOString(),
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create blood request")
      }

      toast({
        title: "Success",
        description: "Blood request created successfully",
      })

      // Redirect to blood requests page
      router.push("/dashboard/requests")
    } catch (error) {
      console.error("Error creating blood request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create blood request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Blood Request</h1>
        <p className="text-muted-foreground">Create a new blood transfusion request</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Enter the details for the blood request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.hospitalId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A_POSITIVE">A+</SelectItem>
                      <SelectItem value="A_NEGATIVE">A-</SelectItem>
                      <SelectItem value="B_POSITIVE">B+</SelectItem>
                      <SelectItem value="B_NEGATIVE">B-</SelectItem>
                      <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                      <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      <SelectItem value="O_POSITIVE">O+</SelectItem>
                      <SelectItem value="O_NEGATIVE">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  {bloodType && (
                    <div className="mt-1 text-sm">
                      {isBloodAvailable(bloodType, units) ? (
                        <span className="text-green-600">Available: {bloodInventory[bloodType]} units</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          Limited availability: {bloodInventory[bloodType] || 0} units
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="10"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Required Date</Label>
                  <Calendar
                    mode="single"
                    selected={requiredDate}
                    onSelect={setRequiredDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    placeholder="Medical reason for the blood transfusion"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Request...
                    </>
                  ) : (
                    "Create Blood Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Details about the selected patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedPatient.name}</h3>
                    <p className="text-sm text-muted-foreground">Hospital ID: {selectedPatient.hospitalId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Blood Type</Label>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="font-medium text-primary">
                        {formatBloodType(selectedPatient.bloodType)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <div>{selectedPatient.gender}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contact</Label>
                    <div>{selectedPatient.contactNumber || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                    <div>
                      {selectedPatient.dateOfBirth
                        ? format(new Date(selectedPatient.dateOfBirth), "MMMM d, yyyy")
                        : "Not provided"}
                    </div>
                  </div>
                </div>

                {selectedPatient.transfusions && selectedPatient.transfusions.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Recent Transfusions</Label>
                    <div className="mt-1 space-y-2">
                      {selectedPatient.transfusions.slice(0, 3).map((transfusion) => (
                        <div
                          key={transfusion.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(transfusion.transfusionDate), "MMMM d, yyyy")}
                          </div>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(transfusion.bloodType)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-md border p-3">
                  <h4 className="mb-2 font-medium">Medical Officer</h4>
                  <div className="text-sm">
                    {selectedPatient.medicalOfficer ? (
                      <span>{selectedPatient.medicalOfficer.user.name}</span>
                    ) : (
                      <span className="text-muted-foreground">No assigned medical officer</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedPatientId ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Failed to load patient information</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Select a patient to view their information</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Blood Inventory Status</CardTitle>
              <CardDescription>Current availability of blood units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  "A_POSITIVE",
                  "A_NEGATIVE",
                  "B_POSITIVE",
                  "B_NEGATIVE",
                  "AB_POSITIVE",
                  "AB_NEGATIVE",
                  "O_POSITIVE",
                  "O_NEGATIVE",
                ].map((type) => (
                  <div key={type} className="flex flex-col items-center rounded-md border p-3">
                    <Badge variant="outline" className="mb-2 font-medium text-primary">
                      {formatBloodType(type)}
                    </Badge>
                    <div className="text-2xl font-bold">{bloodInventory[type] || 0}</div>
                    <div className="text-xs text-muted-foreground">units available</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

