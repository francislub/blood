"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CalendarIcon, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"

const timeSlots = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
]

const donationTypes = [
  { value: "WHOLE_BLOOD", label: "Whole Blood" },
  { value: "PLASMA", label: "Plasma" },
  { value: "PLATELETS", label: "Platelets" },
  { value: "DOUBLE_RED_CELLS", label: "Double Red Cells" },
]

const locations = [
  { id: "1", name: "Main Blood Bank Center" },
  { id: "2", name: "City Hospital Blood Collection Unit" },
  { id: "3", name: "Mobile Blood Drive Unit" },
  { id: "4", name: "Community Health Center" },
]

export default function DonationSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [donorId, setDonorId] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [locationType, setLocationType] = useState("")
  const [donationType, setDonationType] = useState("")
  const [notes, setNotes] = useState("")
  const [existingAppointments, setExistingAppointments] = useState<any[]>([])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "DONOR") {
      router.push("/dashboard")
    }

    if (status === "authenticated" && session?.user?.role === "DONOR") {
      fetchDonorProfile()
      fetchExistingAppointments()
    }
  }, [session, status, router])

  const fetchDonorProfile = async () => {
    try {
      const response = await fetch(`/api/donors/user/${session?.user?.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch donor profile")
      }
      const data = await response.json()
      setDonorId(data.id)
    } catch (error) {
      console.error("Error fetching donor profile:", error)
      setError("Failed to fetch donor profile. Please try again later.")
    }
  }

  const fetchExistingAppointments = async () => {
    try {
      const response = await fetch("/api/donation-appointments")
      if (!response.ok) {
        throw new Error("Failed to fetch existing appointments")
      }
      const data = await response.json()
      setExistingAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!date || !timeSlot || !locationType || !donationType) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/donation-appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorId,
          appointmentDate: date.toISOString(),
          timeSlot,
          locationId: locationType,
          donationType,
          notes,
          status: "SCHEDULED",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to schedule appointment")
      }

      toast({
        title: "Appointment Scheduled",
        description: "Your donation appointment has been scheduled successfully.",
      })

      // Reset form
      setDate(undefined)
      setTimeSlot("")
      setLocationType("")
      setDonationType("")
      setNotes("")

      // Refresh appointments
      fetchExistingAppointments()
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (status === "authenticated" && session?.user?.role === "DONOR") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Schedule a Donation</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
              <CardDescription>Select your preferred date and time for blood donation</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <DatePicker date={date} setDate={setDate} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Select Time Slot</Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationType">Select Location</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donationType">Donation Type</Label>
                  <Select value={donationType} onValueChange={setDonationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {donationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or health information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Appointments</CardTitle>
              <CardDescription>View and manage your scheduled donations</CardDescription>
            </CardHeader>
            <CardContent>
              {existingAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">You have no upcoming appointments</div>
              ) : (
                <div className="space-y-4">
                  {existingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{appointment.donationType.replace("_", " ")}</div>
                        <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {appointment.status}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {appointment.timeSlot}
                      </div>
                      <div className="text-sm">{locations.find((loc) => loc.id === appointment.locationId)?.name}</div>
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground mt-2 border-t pt-2">{appointment.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={fetchExistingAppointments}>
                Refresh Appointments
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

