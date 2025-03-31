"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Download, Filter, FileText, User, Calendar, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export default function MedicalRecordsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [recordTypeFilter, setRecordTypeFilter] = useState("")
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [recordType, setRecordType] = useState("GENERAL")
  const [recordTitle, setRecordTitle] = useState("")
  const [recordDetails, setRecordDetails] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Only medical officers and admins can access medical records
    if (session.user.role !== "MEDICAL_OFFICER" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch patients
        const patientsResponse = await fetch("/api/patients")
        if (!patientsResponse.ok) {
          throw new Error("Failed to fetch patients")
        }
        const patientsData = await patientsResponse.json()
        setPatients(patientsData)

        // Fetch medical records
        const recordsResponse = await fetch("/api/medical-records")
        if (!recordsResponse.ok) {
          throw new Error("Failed to fetch medical records")
        }
        const recordsData = await recordsResponse.json()
        setRecords(recordsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  // Filter records based on search query and filters
  const filteredRecords = records.filter((record) => {
    // Search query filter
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Record type filter
    const matchesType = recordTypeFilter ? record.recordType === recordTypeFilter : true

    return matchesSearch && matchesType
  })

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get badge variant based on record type
  const getRecordTypeBadgeVariant = (type) => {
    switch (type) {
      case "GENERAL":
        return "default"
      case "DIAGNOSIS":
        return "secondary"
      case "TREATMENT":
        return "success"
      case "LAB_RESULT":
        return "warning"
      case "PRESCRIPTION":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Handle form submission
  const handleAddRecord = async (e) => {
    e.preventDefault()

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (!recordTitle) {
      toast({
        title: "Error",
        description: "Please enter a record title",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          recordType,
          title: recordTitle,
          details: recordDetails,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create medical record")
      }

      const newRecord = await response.json()

      // Update the records list
      setRecords([newRecord, ...records])

      // Reset form
      setSelectedPatient("")
      setRecordType("GENERAL")
      setRecordTitle("")
      setRecordDetails("")
      setIsAddRecordOpen(false)

      toast({
        title: "Success",
        description: "Medical record added successfully",
      })
    } catch (error) {
      console.error("Error adding medical record:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add medical record",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">Manage patient medical records and history</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
                <DialogDescription>Create a new medical record for a patient</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRecord}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.hospitalId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="recordType">Record Type</Label>
                    <Select value={recordType} onValueChange={setRecordType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="DIAGNOSIS">Diagnosis</SelectItem>
                        <SelectItem value="TREATMENT">Treatment</SelectItem>
                        <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
                        <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      placeholder="Record title"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      value={recordDetails}
                      onChange={(e) => setRecordDetails(e.target.value)}
                      placeholder="Medical record details"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Record</Button>
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
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                className="w-full pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {recordTypeFilter ? recordTypeFilter.replace("_", " ") : "Record Type"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="DIAGNOSIS">Diagnosis</SelectItem>
                <SelectItem value="TREATMENT">Treatment</SelectItem>
                <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
                <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
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
                    <TableHead>Record ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No medical records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{record.patient.name}</div>
                              <div className="text-xs text-muted-foreground">{record.patient.hospitalId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.title}</TableCell>
                        <TableCell>
                          <Badge variant={getRecordTypeBadgeVariant(record.recordType)}>
                            {record.recordType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(record.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>{record.medicalOfficer.user.name}</TableCell>
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
                                <Link href={`/dashboard/medical-records/${record.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/medical-records/${record.id}/edit`}>Edit Record</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/patients/${record.patient.id}`}>View Patient</Link>
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

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
              <CardDescription>Medical records created in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords
                  .filter((record) => new Date(record.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                  .map((record) => (
                    <div key={record.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="font-medium">{record.title}</div>
                          <Badge variant={getRecordTypeBadgeVariant(record.recordType)}>
                            {record.recordType.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/dashboard/medical-records/${record.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Patient:</span> {record.patient.name} (
                          {record.patient.hospitalId})
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(record.createdAt)}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Created By:</span> {record.medicalOfficer.user.name}
                        </div>
                        {record.details && (
                          <div className="col-span-2 mt-2 rounded-md bg-muted p-2 text-sm">
                            {record.details.length > 150 ? `${record.details.substring(0, 150)}...` : record.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

