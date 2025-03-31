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

const patientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  hospitalId: z.string().optional(),
  gender: z.string().min(1, { message: "Gender is required" }),
  age: z.coerce.number().min(0, { message: "Age must be a positive number" }),
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  diagnosis: z.string().min(1, { message: "Diagnosis is required" }),
  doctor: z.string().min(1, { message: "Doctor is required" }),
  status: z.string().min(1, { message: "Status is required" }),
})

type PatientValues = z.infer<typeof patientSchema>

export default function EditPatientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [patient, setPatient] = useState<any>(null)
  const { toast } = useToast()

  const form = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      hospitalId: "",
      gender: "",
      age: 0,
      bloodType: "",
      contactNumber: "",
      address: "",
      diagnosis: "",
      doctor: "",
      status: "",
    },
  })

  useEffect(() => {
    if (status === "authenticated" && !["ADMIN", "MEDICAL_OFFICER"].includes(session?.user?.role as string)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchPatient()
    }
  }, [session, status, router, patientId])

  const fetchPatient = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch patient")
      }
      const data = await response.json()
      setPatient(data)

      // Calculate age from date of birth
      const dob = new Date(data.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--
      }

      // Set form values
      form.reset({
        name: data.name,
        hospitalId: data.hospitalId || "",
        gender: data.gender,
        age: age,
        bloodType: data.bloodType,
        contactNumber: data.contactNumber || "",
        address: data.address || "",
        diagnosis: data.diagnosis,
        doctor: data.doctor,
        status: data.status,
      })
    } catch (error) {
      console.error("Error fetching patient:", error)
      setError("Failed to fetch patient details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PatientValues) => {
    setIsLoading(true)
    setError("")

    try {
      // Calculate date of birth from age
      const dob = new Date()
      dob.setFullYear(dob.getFullYear() - data.age)

      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateOfBirth: dob.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update patient")
      }

      toast({
        title: "Patient Updated",
        description: "The patient record has been updated successfully.",
      })

      router.push(`/dashboard/patients/${patientId}`)
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

  if (status === "authenticated" && ["ADMIN", "MEDICAL_OFFICER"].includes(session?.user?.role as string)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
            <CardDescription>Update patient information. Please ensure all information is accurate.</CardDescription>
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

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Patient's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hospitalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital ID" {...field} />
                        </FormControl>
                        <FormDescription>Optional hospital identification number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADMITTED">Admitted</SelectItem>
                            <SelectItem value="DISCHARGED">Discharged</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attending Doctor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dr. Sarah Kimaro">Dr. Sarah Kimaro</SelectItem>
                            <SelectItem value="Dr. James Mwakasege">Dr. James Mwakasege</SelectItem>
                            <SelectItem value="Dr. Emily Davis">Dr. Emily Davis</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Patient's address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Primary diagnosis" className="min-h-[80px]" {...field} />
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
                  {isLoading ? "Updating..." : "Update Patient"}
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

