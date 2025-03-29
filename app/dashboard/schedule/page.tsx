"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CalendarIcon, Clock, MapPin, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function SchedulePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEligible, setIsEligible] = useState(true)
  const [nextEligibleDate, setNextEligibleDate] = useState<Date | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // In a real application, you would fetch eligibility data from your API
    // This is just mock data for demonstration
    const mockEligibilityData = {
      isEligible: true,
      nextEligibleDate: null,
    }

    // Simulate API call
    setTimeout(() => {
      setIsEligible(mockEligibilityData.isEligible)
      setNextEligibleDate(mockEligibilityData.nextEligibleDate)
    }, 500)
  }, [])

  useEffect(() => {
    if (date) {
      // In a real application, you would fetch available time slots for the selected date
      // This is just mock data for demonstration
      const mockTimeSlots = [
        { id: "1", time: "09:00 AM", available: true },
        { id: "2", time: "10:00 AM", available: true },
        { id: "3", time: "11:00 AM", available: true },
        { id: "4", time: "12:00 PM", available: false },
        { id: "5", time: "01:00 PM", available: true },
        { id: "6", time: "02:00 PM", available: true },
        { id: "7", time: "03:00 PM", available: true },
        { id: "8", time: "04:00 PM", available: false },
      ]

      // Simulate API call
      setTimeout(() => {
        setAvailableTimeSlots(mockTimeSlots)
      }, 500)
    }
  }, [date])

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!date || !timeSlot) {
      setError("Please select both a date and time slot")
      setIsLoading(false)
      return
    }

    try {
      // In a real application, you would send this data to your API
      // This is just a simulation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      setIsLoading(false)
    } catch (error) {
      setError("Failed to schedule donation. Please try again.")
      setIsLoading(false)
    }
  }

  const handleNextStep = () => {
    if (step === 1 && date) {
      setStep(2)
    } else if (step === 2 && timeSlot) {
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Helper function to disable past dates and dates when not eligible
  const disabledDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Disable past dates
    if (date < today) return true

    // Disable dates before next eligible date if not eligible
    if (!isEligible && nextEligibleDate && date < nextEligibleDate) return true

    // Disable Sundays (assuming the blood bank is closed on Sundays)
    if (date.getDay() === 0) return true

    return false
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Donation Scheduled!</CardTitle>
            <CardDescription>Your blood donation has been scheduled successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-center gap-2 text-lg font-medium">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {date?.toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5 text-primary" />
                {timeSlot}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Nyamagana District Hospital Blood Bank
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Please remember to:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Bring a valid ID</li>
                <li>• Eat a healthy meal before donation</li>
                <li>• Stay hydrated</li>
                <li>• Get plenty of rest the night before</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button onClick={() => router.push("/dashboard/donation-history")}>View Donation History</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Donation</h1>
        <p className="text-muted-foreground">Book your next blood donation appointment</p>
      </div>

      {!isEligible && nextEligibleDate && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not eligible to donate blood until {nextEligibleDate.toLocaleDateString()}. This is to ensure your
            health and safety.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Schedule a Blood Donation</CardTitle>
          <CardDescription>Select a date and time for your next donation</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Step 1: Select a Date</div>
                <div className="rounded-md border">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={disabledDates}
                    className="mx-auto"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Available donation days: Monday to Saturday</p>
                  <p>Please select a date to continue</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Step 2: Select a Time Slot</div>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={timeSlot === slot.time ? "default" : "outline"}
                      className="justify-start"
                      disabled={!slot.available}
                      onClick={() => setTimeSlot(slot.time)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {slot.time}
                      {!slot.available && (
                        <Badge variant="outline" className="ml-auto">
                          Booked
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Please select an available time slot</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Step 3: Additional Information</div>
                <div className="rounded-lg border p-4">
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="flex items-center gap-2 font-medium">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        {date?.toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Time</div>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        {timeSlot}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      Nyamagana District Hospital Blood Bank
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or information you'd like us to know..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          {step < 3 ? (
            <Button onClick={handleNextStep} disabled={(step === 1 && !date) || (step === 2 && !timeSlot)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSchedule} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Scheduling...
                </>
              ) : (
                "Schedule Donation"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

