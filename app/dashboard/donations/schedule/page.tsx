"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Droplet, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ScheduleDonationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const donorId = searchParams.get("donorId")

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [donor, setDonor] = useState(null)
  const [donors, setDonors] = useState([])
  const [selectedDonorId, setSelectedDonorId] = useState(donorId || "")
  const [date, setDate] = useState(null)
  const [time, setTime] = useState("09:00")
  const [notes, setNotes] = useState("")
  const [existingAppointments, setExistingAppointments] = useState([])

  // Fetch donors list if user is admin or technician
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchDonors = async () => {
      if (session.user.role === "ADMIN" || session.user.role === "BLOOD_BANK_TECHNICIAN") {
        try {
          const response = await fetch("/api/donors")
          if (!response.ok) throw new Error("Failed to fetch donors")
          const data = await response.json()
          setDonors(data)
        } catch (error) {
          console.error("Error fetching donors:", error)
          toast({
            title: "Error",
            description: "Failed to load donors list",
            variant: "destructive",
          })
        }
      } else if (session.user.role === "DONOR") {
        try {
          const response = await fetch(`/api/donors/user/${session.user.id}`)
          if (!response.ok) throw new Error("Failed to fetch donor profile")
          const data = await response.json()
          setDonor(data)
          setSelectedDonorId(data.id)
        } catch (error) {
          console.error("Error fetching donor profile:", error)
          toast({
            title: "Error",
            description: "Failed to load your donor profile",
            variant: "destructive",
          })
        }
      }
    }

    fetchDonors()
  }, [session, status, router])

  // Fetch existing appointments for the selected date
  useEffect(() => {
    if (!date) return

    const fetchAppointments = async () => {
      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const response = await fetch(`/api/donation-appointments?date=${formattedDate}`)
        if (!response.ok) throw new Error("Failed to fetch appointments")
        const data = await response.json()
        setExistingAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [date])

  // Fetch donor details when donor ID is selected
  useEffect(() => {
    if (!selectedDonorId) return

    const fetchDonorDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/donors/${selectedDonorId}`)
        if (!response.ok) throw new Error("Failed to fetch donor details")
        const data = await response.json()
        setDonor(data)
      } catch (error) {
        console.error("Error fetching donor details:", error)
        toast({
          title: "Error",
          description: "Failed to load donor details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonorDetails()
  }, [selectedDonorId])

  // Format blood type for display
  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Check if donor is eligible to donate
  const isEligible = (donor) => {
    if (!donor) return false
    if (!donor.eligibleToDonateSince) return true
    return new Date(donor.eligibleToDonateSince) <= new Date()
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDonorId) {
      toast({
        title: "Error",
        description: "Please select a donor",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    // Combine date and time
    const appointmentDate = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    appointmentDate.setHours(hours, minutes, 0, 0)

    // Check if date is in the past
    if (appointmentDate < new Date()) {
      toast({
        title: "Error",
        description: "Cannot schedule appointments in the past",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/donation-appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorId: selectedDonorId,
          appointmentDate: appointmentDate.toISOString(),
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to schedule donation")
      }

      toast({
        title: "Success",
        description: "Donation appointment scheduled successfully",
      })

      // Redirect to donations page
      router.push("/dashboard/donations")
    } catch (error) {
      console.error("Error scheduling donation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to schedule donation",
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
        <h1 className="text-3xl font-bold tracking-tight">Schedule Donation</h1>
        <p className="text-muted-foreground">Schedule a new blood donation appointment</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Enter the details for the donation appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {(session?.user?.role === "ADMIN" || session?.user?.role === "BLOOD_BANK_TECHNICIAN") && (
                  <div className="space-y-2">
                    <Label htmlFor="donor">Select Donor</Label>
                    <Select value={selectedDonorId} onValueChange={setSelectedDonorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {donors.map((donor) => (
                          <SelectItem key={donor.id} value={donor.id}>
                            {donor.user.name} ({formatBloodType(donor.bloodType)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Appointment Time</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or notes for this donation"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isLoading || !donor || !isEligible(donor)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Donation"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {date && existingAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Existing Appointments</CardTitle>
                <CardDescription>
                  Appointments already scheduled for {date ? format(date, "MMMM d, yyyy") : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {existingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(appointment.date), "h:mm a")}</span>
                        <span className="text-sm text-muted-foreground">
                          {appointment.donor.user.name} ({formatBloodType(appointment.donor.bloodType)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : donor ? (
            <Card>
              <CardHeader>
                <CardTitle>Donor Information</CardTitle>
                <CardDescription>Details about the selected donor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{donor.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{donor.user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Blood Type</Label>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="font-medium text-primary">
                        {formatBloodType(donor.bloodType)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <div>{donor.gender}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <div>{donor.user.phoneNumber || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                    <div>
                      {donor.dateOfBirth ? format(new Date(donor.dateOfBirth), "MMMM d, yyyy") : "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <h4 className="mb-2 font-medium">Donation Eligibility</h4>
                  {isEligible(donor) ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      <span>Eligible to donate</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="h-2 w-2 rounded-full bg-amber-600"></div>
                      <span>
                        Not eligible until{" "}
                        {donor.eligibleToDonateSince
                          ? format(new Date(donor.eligibleToDonateSince), "MMMM d, yyyy")
                          : "unknown date"}
                      </span>
                    </div>
                  )}
                </div>

                {donor.lastDonationDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Donation</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(donor.lastDonationDate), "MMMM d, yyyy")}
                    </div>
                  </div>
                )}

                {donor.donations && donor.donations.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Recent Donations</Label>
                    <div className="mt-1 space-y-2">
                      {donor.donations.slice(0, 3).map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(donation.date), "MMMM d, yyyy")}
                          </div>
                          <Badge variant={donation.status === "COMPLETED" ? "success" : "secondary"}>
                            {donation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : selectedDonorId ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Failed to load donor information</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Select a donor to view their information</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

