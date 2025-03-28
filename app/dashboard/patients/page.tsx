"use client"

import { useState } from "react"
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

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

  // Mock data for patients
  const patients = [
    {
      id: "P12345",
      name: "John Doe",
      age: 45,
      gender: "Male",
      bloodType: "A_POSITIVE",
      status: "ADMITTED",
      admissionDate: "2023-06-01",
      diagnosis: "Anemia",
      doctor: "Dr. James Mwakasege",
    },
    {
      id: "P12346",
      name: "Jane Smith",
      age: 32,
      gender: "Female",
      bloodType: "O_NEGATIVE",
      status: "DISCHARGED",
      admissionDate: "2023-05-15",
      dischargeDate: "2023-05-25",
      diagnosis: "Post-operative care",
      doctor: "Dr. Emily Davis",
    },
    {
      id: "P12347",
      name: "Robert Johnson",
      age: 58,
      gender: "Male",
      bloodType: "B_POSITIVE",
      status: "ADMITTED",
      admissionDate: "2023-06-05",
      diagnosis: "Gastrointestinal bleeding",
      doctor: "Dr. James Mwakasege",
    },
    {
      id: "P12348",
      name: "Emily Davis",
      age: 28,
      gender: "Female",
      bloodType: "AB_POSITIVE",
      status: "ADMITTED",
      admissionDate: "2023-06-08",
      diagnosis: "Pregnancy complications",
      doctor: "Dr. Sarah Kimaro",
    },
    {
      id: "P12349",
      name: "Michael Brown",
      age: 42,
      gender: "Male",
      bloodType: "O_POSITIVE",
      status: "DISCHARGED",
      admissionDate: "2023-05-20",
      dischargeDate: "2023-06-02",
      diagnosis: "Trauma",
      doctor: "Dr. Emily Davis",
    },
    {
      id: "P12350",
      name: "Sarah Williams",
      age: 35,
      gender: "Female",
      bloodType: "A_NEGATIVE",
      status: "ADMITTED",
      admissionDate: "2023-06-07",
      diagnosis: "Sickle cell crisis",
      doctor: "Dr. James Mwakasege",
    },
  ]

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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="First name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Last name" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select>
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
                    <Input id="age" type="number" placeholder="Age" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="blood-type">Blood Type</Label>
                    <Select>
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
                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input id="diagnosis" placeholder="Primary diagnosis" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctor">Attending Doctor</Label>
                  <Select>
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
                <Button onClick={() => setIsAddPatientOpen(false)}>Register Patient</Button>
              </DialogFooter>
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
                <SelectItem value="">All Types</SelectItem>
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ADMITTED">Admitted</SelectItem>
                <SelectItem value="DISCHARGED">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
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
              <div className="rounded-md border">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="font-medium">Recent Transfusions</div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/transfusions">View All</Link>
                  </Button>
                </div>
                <div className="divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">John Doe (P12345)</div>
                        <div className="text-sm text-muted-foreground">2 units of A+ • June 10, 2023</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/transfusions/1">Details</Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Robert Johnson (P12347)</div>
                        <div className="text-sm text-muted-foreground">1 unit of B+ • June 8, 2023</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/transfusions/2">Details</Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Sarah Williams (P12350)</div>
                        <div className="text-sm text-muted-foreground">3 units of A- • June 7, 2023</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/transfusions/3">Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

