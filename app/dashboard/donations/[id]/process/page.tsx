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
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Calendar, User, Droplet, CheckCircle, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProcessDonationPage({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const donationId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [donation, setDonation] = useState(null)
  const [bloodPressure, setBloodPressure] = useState("")
  const [hemoglobin, setHemoglobin] = useState("")
  const [weight, setWeight] = useState("")
  const [temperature, setTemperature] = useState("")
  const [pulse, setPulse] = useState("")
  const [units, setUnits] = useState(1)
  const [notes, setNotes] = useState("")
  const [eligibilityChecks, setEligibilityChecks] = useState({
    noRecentIllness: true,
    noRecentVaccination: true,
    noRecentSurgery: true,
    noRecentTattoo: true,
    noRecentPregnancy: true,
    noHighRiskBehavior: true,
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Only blood bank technicians and admins can process donations
    if (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchDonation = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/donations/${donationId}`)
        if (!response.ok) throw new Error("Failed to fetch donation")
        const data = await response.json()

        // Check if donation is already processed
        if (data.status !== "SCHEDULED") {
          toast({
            title: "Error",
            description: `This donation has already been ${data.status.toLowerCase()}`,
            variant: "destructive",
          })
          router.push("/dashboard/donations")
          return
        }

        setDonation(data)
      } catch (error) {
        console.error("Error fetching donation:", error)
        toast({
          title: "Error",
          description: "Failed to load donation details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonation()
  }, [session, status, router, donationId])

  // Format blood type for display
  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Check if all eligibility criteria are met
  const isEligible = () => {
    return (
      Object.values(eligibilityChecks).every(Boolean) &&
      Number.parseFloat(hemoglobin) >= 12.5 &&
      Number.parseFloat(weight) >= 50 &&
      Number.parseFloat(temperature) <= 37.5 &&
      Number.parseFloat(pulse) >= 50 &&
      Number.parseFloat(pulse) <= 100
    )
  }

  // Handle eligibility check change
  const handleEligibilityChange = (key, checked) => {
    setEligibilityChecks({
      ...eligibilityChecks,
      [key]: checked,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isEligible()) {
      toast({
        title: "Error",
        description: "Donor does not meet all eligibility criteria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/donations/${donationId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bloodPressure,
          hemoglobin: Number.parseFloat(hemoglobin),
          weight: Number.parseFloat(weight),
          temperature: Number.parseFloat(temperature),
          pulse: Number.parseFloat(pulse),
          units: Number.parseInt(units),
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process donation")
      }

      toast({
        title: "Success",
        description: "Donation processed successfully",
      })

      // Redirect to donations page
      router.push("/dashboard/donations")
    } catch (error) {
      console.error("Error processing donation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle donation cancellation
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this donation?")) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/donations/${donationId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: "Donor did not meet eligibility criteria",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel donation")
      }

      toast({
        title: "Success",
        description: "Donation cancelled successfully",
      })

      // Redirect to donations page
      router.push("/dashboard/donations")
    } catch (error) {
      console.error("Error cancelling donation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel donation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Process Donation</h1>
        <p className="text-muted-foreground">Record blood donation details and create blood units</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donor Eligibility</CardTitle>
              <CardDescription>Check donor eligibility before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noRecentIllness"
                    checked={eligibilityChecks.noRecentIllness}
                    onCheckedChange={(checked) => handleEligibilityChange("noRecentIllness", checked)}
                  />
                  <Label htmlFor="noRecentIllness">No recent illness or infection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noRecentVaccination"
                    checked={eligibilityChecks.noRecentVaccination}
                    onCheckedChange={(checked) => handleEligibilityChange("noRecentVaccination", checked)}
                  />
                  <Label htmlFor="noRecentVaccination">No recent vaccination (last 4 weeks)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noRecentSurgery"
                    checked={eligibilityChecks.noRecentSurgery}
                    onCheckedChange={(checked) => handleEligibilityChange("noRecentSurgery", checked)}
                  />
                  <Label htmlFor="noRecentSurgery">No recent surgery (last 6 months)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noRecentTattoo"
                    checked={eligibilityChecks.noRecentTattoo}
                    onCheckedChange={(checked) => handleEligibilityChange("noRecentTattoo", checked)}
                  />
                  <Label htmlFor="noRecentTattoo">No recent tattoo or piercing (last 6 months)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noRecentPregnancy"
                    checked={eligibilityChecks.noRecentPregnancy}
                    onCheckedChange={(checked) => handleEligibilityChange("noRecentPregnancy", checked)}
                  />
                  <Label htmlFor="noRecentPregnancy">No recent pregnancy (last 6 months)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noHighRiskBehavior"
                    checked={eligibilityChecks.noHighRiskBehavior}
                    onCheckedChange={(checked) => handleEligibilityChange("noHighRiskBehavior", checked)}
                  />
                  <Label htmlFor="noHighRiskBehavior">No high-risk behavior</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Record donor's vital signs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      min="0"
                      value={hemoglobin}
                      onChange={(e) => setHemoglobin(e.target.value)}
                      required
                    />
                    {hemoglobin && Number.parseFloat(hemoglobin) < 12.5 && (
                      <p className="text-xs text-red-500">Hemoglobin must be at least 12.5 g/dL</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                    <Input
                      id="bloodPressure"
                      placeholder="120/80"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                    {weight && Number.parseFloat(weight) < 50 && (
                      <p className="text-xs text-red-500">Weight must be at least 50 kg</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="35"
                      max="40"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      required
                    />
                    {temperature && Number.parseFloat(temperature) > 37.5 && (
                      <p className="text-xs text-red-500">Temperature must be below 37.5°C</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pulse">Pulse (bpm)</Label>
                    <Input
                      id="pulse"
                      type="number"
                      min="0"
                      max="200"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      required
                    />
                    {pulse && (Number.parseFloat(pulse) < 50 || Number.parseFloat(pulse) > 100) && (
                      <p className="text-xs text-red-500">Pulse must be between 50-100 bpm</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units Collected</Label>
                    <Select value={units.toString()} onValueChange={(value) => setUnits(Number.parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Unit (450 ml)</SelectItem>
                        <SelectItem value="2">2 Units (900 ml)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the donation"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !isEligible()}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Donation"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    Cancel Donation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {donation && (
            <Card>
              <CardHeader>
                <CardTitle>Donation Information</CardTitle>
                <CardDescription>Details about the scheduled donation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{donation.donor.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{donation.donor.user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Blood Type</Label>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="font-medium text-primary">
                        {formatBloodType(donation.donor.bloodType)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <div>{donation.donor.gender}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <div>{donation.donor.user.phoneNumber || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Appointment Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(donation.date), "MMMM d, yyyy h:mm a")}
                    </div>
                  </div>
                </div>

                {donation.donor.lastDonationDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Donation</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(donation.donor.lastDonationDate), "MMMM d, yyyy")}
                    </div>
                  </div>
                )}

                {donation.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Appointment Notes</Label>
                    <div className="rounded-md bg-muted p-2 text-sm">{donation.notes}</div>
                  </div>
                )}

                <div className="rounded-md border p-3">
                  <h4 className="mb-2 font-medium">Eligibility Status</h4>
                  {isEligible() ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Eligible to donate</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Not eligible - check requirements</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Donation Process</CardTitle>
              <CardDescription>Steps to complete the donation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Verify donor identity</h4>
                    <p className="text-sm text-muted-foreground">Check donor's ID and confirm appointment details</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Check eligibility</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify donor meets all health and safety requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Record vital signs</h4>
                    <p className="text-sm text-muted-foreground">
                      Measure and record hemoglobin, blood pressure, weight, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Collect blood</h4>
                    <p className="text-sm text-muted-foreground">
                      Perform venipuncture and collect blood in appropriate bags
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Complete documentation</h4>
                    <p className="text-sm text-muted-foreground">Record all details and submit the form</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

