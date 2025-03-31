"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"

const bloodRequestSchema = z.object({
  patientId: z.string().min(1, { message: "Patient is required" }),
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  unitsRequired: z.coerce.number().min(1, { message: "At least 1 unit is required" }),
  urgency: z.string().min(1, { message: "Urgency level is required" }),
  requiredBy: z.date({ required_error: "Required by date is required" }),
  reason: z.string().min(5, { message: "Reason must be at least 5 characters" }),
  notes: z.string().optional(),
})

type BloodRequestValues = z.infer<typeof bloodRequestSchema>

export default function NewBloodRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState<any[]>([])
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [selectedBloodType, setSelectedBloodType] = useState("")

  const form = useForm<BloodRequestValues>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: {
      patientId: "",
      bloodType: "",
      unitsRequired: 1,
      urgency: "NORMAL",
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reason: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (status === "authenticated" && !["ADMIN", "MEDICAL_OFFICER"].includes(session?.user?.role as string)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchPatients()
    }
  }, [session, status, router])

  useEffect(() => {
    if (selectedBloodType) {
      fetchAvailableUnits(selectedBloodType)
    }
  }, [selectedBloodType])

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients")
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error("Error fetching patients:", error)
      setError("Failed to fetch patients. Please try again later.")
    }
  }

  const fetchAvailableUnits = async (bloodType: string) => {
    try {
      const response = await fetch(`/api/blood-units/status?bloodType=${bloodType}&status=AVAILABLE`)
      if (!response.ok) {
        throw new Error("Failed to fetch available units")
      }
      const data = await response.json()
      setAvailableUnits(data)
    } catch (error) {
      console.error("Error fetching available units:", error)
    }
  }

  const onSubmit = async (data: BloodRequestValues) => {
    setIsLoading(true)
    setError("")

    try {
      // Check if there are enough units available
      if (availableUnits.length < data.unitsRequired) {
        setError(`Only ${availableUnits.length} units of ${data.bloodType} are available. Please adjust the request.`)
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          requiredBy: data.requiredBy.toISOString(),
          requestedBy: session?.user?.id,
          status: "PENDING",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create blood request")
      }

      toast({
        title: "Blood Request Created",
        description: "The blood request has been created successfully.",
      })

      router.push("/dashboard/requests")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBloodTypeChange = (value: string) => {
    setSelectedBloodType(value)
    form.setValue("bloodType", value)
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (status === "authenticated" && ["ADMIN", "MEDICAL_OFFICER"].includes(session?.user?.role as string)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create New Blood Request</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blood Request Details</CardTitle>
            <CardDescription>
              Create a new blood request for a patient. Please ensure all information is accurate.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name} ({patient.hospitalId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select onValueChange={handleBloodTypeChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                          </FormControl>
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
                        {selectedBloodType && (
                          <FormDescription>
                            Available units: <span className="font-medium">{availableUnits.length}</span>
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="unitsRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Units Required</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requiredBy"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Required By</FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Request</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Surgery, Anemia treatment, Emergency transfusion..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information or special requirements..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Blood Request"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    )
  }

  return null
}

