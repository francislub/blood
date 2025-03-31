"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"

const donorSchema = z.object({
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  weight: z.coerce.number().min(45, { message: "Weight must be at least 45 kg" }),
  height: z.coerce.number().min(0, { message: "Height must be a positive number" }),
  lastDonationDate: z.date().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
})

type DonorValues = z.infer<typeof donorSchema>

export default function EditDonorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const donorId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [donor, setDonor] = useState<any>(null)
  const { toast } = useToast()

  const form = useForm<DonorValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      bloodType: "",
      weight: 0,
      height: 0,
      lastDonationDate: undefined,
      medicalConditions: "",
      medications: "",
      allergies: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (status === "authenticated" && !["ADMIN", "TECHNICIAN"].includes(session?.user?.role as string)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchDonor()
    }
  }, [session, status, router, donorId])

  const fetchDonor = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/donors/${donorId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch donor")
      }
      const data = await response.json()
      setDonor(data)

      // Set form values
      form.reset({
        bloodType: data.bloodType,
        weight: data.weight || 0,
        height: data.height || 0,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
        medicalConditions: data.medicalConditions || "",
        medications: data.medications || "",
        allergies: data.allergies || "",
        notes: data.notes || "",
      })
    } catch (error) {
      console.error("Error fetching donor:", error)
      setError("Failed to fetch donor details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: DonorValues) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/donors/${donorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          lastDonationDate: data.lastDonationDate ? data.lastDonationDate.toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update donor")
      }

      toast({
        title: "Donor Updated",
        description: "The donor record has been updated successfully.",
      })

      router.push(`/dashboard/donors/${donorId}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (status === "authenticated" && ["ADMIN", "TECHNICIAN"].includes(session?.user?.role as string)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Donor</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donor Details</CardTitle>
            <CardDescription>Update donor information. Please ensure all information is accurate.</CardDescription>
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

                {donor && (
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium">Donor Information</h3>
                    <p className="text-sm text-muted-foreground">
                      {donor.user.name} • {donor.user.email} • {donor.user.phoneNumber}
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="45"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Minimum weight for donation is 45 kg</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lastDonationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Donation Date</FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormDescription>Leave empty if this is the first donation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any medical conditions..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any current medications..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any allergies..." className="min-h-[80px]" {...field} />
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
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional information..." className="min-h-[80px]" {...field} />
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
                  {isLoading ? "Updating..." : "Update Donor"}
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

