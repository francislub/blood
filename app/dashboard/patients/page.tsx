"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  Download,
  Filter,
  Calendar,
  User,
  Droplet,
  Activity,
  MoreHorizontal,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  bloodType: string
  status: string
  admissionDate: string
  dischargeDate?: string
  diagnosis: string
  doctor: string
}

export default function PatientsPage() {
  // Update the newPatient state to include hospitalId
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    bloodType: "",
    diagnosis: "",
    doctor: "",
    hospitalId: "",
    contactNumber: "",
    address: "",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
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
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [toast])

  // Update the form submission to include all required fields
  const handleAddPatient = async (e) => {
    e.preventDefault()
    try {
      // Create a properly formatted patient object
      const patientData = {
        name: `${newPatient.firstName} ${newPatient.lastName}`,
        hospitalId: newPatient.hospitalId || `PT-${Date.now().toString().slice(-6)}`, // Generate a hospital ID if not provided
        dateOfBirth: new Date(
          new Date().setFullYear(new Date().getFullYear() - Number.parseInt(newPatient.age)),
        ).toISOString(),
        gender: newPatient.gender,
        bloodType: newPatient.bloodType,
        contactNumber: newPatient.contactNumber,
        address: newPatient.address,
        diagnosis: newPatient.diagnosis,
      }

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add patient")
      }

      toast({
        title: "Success",
        description: "Patient added successfully",
      })

      setIsAddPatientOpen(false)
      setNewPatient({
        firstName: "",
        lastName: "",
        gender: "",
        age: "",
        bloodType: "",
        diagnosis: "",
        doctor: "",
        hospitalId: "",
        contactNumber: "",
        address: "",
      })

      // Refresh the patient list
      const patientsResponse = await fetch("/api/patients")
      const patientsData = await patientsResponse.json()
      setPatients(patientsData)
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Filter patients based on search query and filters
  const filteredPatients = patients.filter((patient) => {
    // Search query filter
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? patient.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter ? patient.status === statusFilter : true

    return matchesSearch && matchesBloodType && matchesStatus
  })

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and blood transfusion requests</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Register a new patient in the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPatient}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="First name"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Last name"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {/* Add hospitalId field to the form */}
                  {/* Add this after the first name and last name fields in the form */}
                  <div className="grid gap-2">
                    <Label htmlFor="hospital-id">Hospital ID</Label>
                    <Input
                      id="hospital-id"
                      placeholder="Hospital ID"
                      value={newPatient.hospitalId}
                      onChange={(e) => setNewPatient({ ...newPatient, hospitalId: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={newPatient.gender}
                        onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blood-type">Blood Type</Label>
                      <Select
                        value={newPatient.bloodType}
                        onValueChange={(value) => setNewPatient({ ...newPatient, bloodType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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
                    </div>
                  </div>
                  {/* Add contact information fields to the form */}
                  {/* Add these after the blood type field */}
                  <div className="grid gap-2">
                    <Label htmlFor="contact-number">Contact Number</Label>
                    <Input
                      id="contact-number"
                      placeholder="Contact number"
                      value={newPatient.contactNumber}
                      onChange={(e) => setNewPatient({ ...newPatient, contactNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      placeholder="Primary diagnosis"
                      value={newPatient.diagnosis}
                      onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="doctor">Attending Doctor</Label>
                    <Select
                      value={newPatient.doctor}
                      onValueChange={(value) => setNewPatient({ ...newPatient, doctor: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-kimaro">Dr. Sarah Kimaro</SelectItem>
                        <SelectItem value="dr-mwakasege">Dr. James Mwakasege</SelectItem>
                        <SelectItem value="dr-davis">Dr. Emily Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Register Patient</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <TabsList>
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="admitted">Admitted</TabsTrigger>
            <TabsTrigger value="transfusion">Transfusion Patients</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="w-full pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Droplet className="mr-2 h-4 w-4" />
                  {bloodTypeFilter ? formatBloodType(bloodTypeFilter) : "Blood Type"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter ? statusFilter : "Status"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ADMITTED">Admitted</SelectItem>
                <SelectItem value="DISCHARGED">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No patients found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{patient.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {patient.age} years • {patient.gender}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(patient.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={patient.status === "ADMITTED" ? "default" : "secondary"}>
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(patient.admissionDate)}
                            </div>
                          </TableCell>
                          <TableCell>{patient.diagnosis}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/patients/${patient.id}`}>
                                    <User className="mr-2 h-4 w-4" />
                                    View Patient
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/patients/${patient.id}/edit`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Edit Record
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/requests/new?patientId=${patient.id}`}>
                                    <Droplet className="mr-2 h-4 w-4" />
                                    Request Blood
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/patients/${patient.id}/history`}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Transfusion History
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admitted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admitted Patients</CardTitle>
              <CardDescription>Currently admitted patients</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients
                      .filter((patient) => patient.status === "ADMITTED")
                      .map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{patient.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {patient.age} years • {patient.gender}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(patient.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(patient.admissionDate)}
                            </div>
                          </TableCell>
                          <TableCell>{patient.diagnosis}</TableCell>
                          <TableCell>{patient.doctor}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/requests/new?patientId=${patient.id}`}>Request Blood</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfusion" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfusion Patients</CardTitle>
              <CardDescription>Patients who have received blood transfusions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="flex items-center justify-between border-b p-4">
                    <div className="font-medium">Recent Transfusions</div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/transfusions">View All</Link>
                    </Button>
                  </div>
                  <div className="divide-y">
                    {filteredPatients
                      .filter((patient) => patient.status === "ADMITTED")
                      .slice(0, 3)
                      .map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {patient.name} ({patient.id})
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 3) + 1} units of {formatBloodType(patient.bloodType)} •{" "}
                                {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/transfusions/${patient.id}`}>Details</Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

