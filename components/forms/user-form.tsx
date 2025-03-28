"use client"

import { useState } from "react"
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

// Define the form schema with Zod
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(),
  role: z.enum(["ADMIN", "DONOR", "MEDICAL_OFFICER", "BLOOD_BANK_TECHNICIAN"]),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  // Role-specific fields will be added conditionally
})

type UserFormValues = z.infer<typeof userFormSchema> & {
  donor?: {
    bloodType: string
    dateOfBirth: string
    gender: string
    weight: number
    height: number
    medicalHistory: string
  }
  medicalOfficer?: {
    licenseNumber: string
    department: string
    position: string
  }
  technician?: {
    employeeId: string
    specialization: string
  }
}

interface UserFormProps {
  initialData?: UserFormValues
  userId?: string
  isEditMode?: boolean
}

export default function UserForm({ initialData, userId, isEditMode = false }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRole, setSelectedRole] = useState(initialData?.role || "DONOR")

  // Initialize the form with default values or provided data
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      role: "DONOR",
      phoneNumber: "",
      address: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    setError("")

    try {
      // Add role-specific data based on the selected role
      if (data.role === "DONOR") {
        data.donor = {
          bloodType: data.donor?.bloodType || "A_POSITIVE",
          dateOfBirth: data.donor?.dateOfBirth || new Date().toISOString().split("T")[0],
          gender: data.donor?.gender || "MALE",
          weight: data.donor?.weight || 70,
          height: data.donor?.height || 170,
          medicalHistory: data.donor?.medicalHistory || "",
        }
      } else if (data.role === "MEDICAL_OFFICER") {
        data.medicalOfficer = {
          licenseNumber: data.medicalOfficer?.licenseNumber || "",
          department: data.medicalOfficer?.department || "",
          position: data.medicalOfficer?.position || "",
        }
      } else if (data.role === "BLOOD_BANK_TECHNICIAN") {
        data.technician = {
          employeeId: data.technician?.employeeId || "",
          specialization: data.technician?.specialization || "",
        }
      }

      // Determine if we're creating or updating a user
      const url = isEditMode ? `/api/users/${userId}` : "/api/users"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save user")
      }

      toast({
        title: isEditMode ? "User updated" : "User created",
        description: isEditMode ? "The user has been updated successfully." : "The user has been created successfully.",
      })

      // Redirect to the users list or user detail page
      router.push("/dashboard/users")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle role change to update form fields
  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserFormValues["role"])
    form.setValue("role", value as UserFormValues["role"])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the user's information and role-specific details."
            : "Enter the user's information and role-specific details."}
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

            {/* Basic user information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditMode ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={handleRoleChange}
                      defaultValue={field.value}
                      disabled={isEditMode} // Disable role change in edit mode
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                        <SelectItem value="DONOR">Donor</SelectItem>
                        <SelectItem value="MEDICAL_OFFICER">Medical Officer</SelectItem>
                        <SelectItem value="BLOOD_BANK_TECHNICIAN">Blood Bank Technician</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>This determines what features and pages the user can access.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+255 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Mwanza, Tanzania" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional fields based on role */}
            {selectedRole === "DONOR" && (
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Donor Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="donor.bloodType"
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

                  <FormField
                    control={form.control}
                    name="donor.dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="donor.gender"
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
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="donor.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="donor.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="donor.medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any relevant medical history, allergies, or conditions..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedRole === "MEDICAL_OFFICER" && (
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Medical Officer Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="medicalOfficer.licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="MED12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalOfficer.department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Hematology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medicalOfficer.position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Medical Officer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedRole === "BLOOD_BANK_TECHNICIAN" && (
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Blood Bank Technician Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="technician.employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="TECH12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technician.specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input placeholder="Blood Component Processing" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditMode ? "Update User" : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

