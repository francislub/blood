"use client"

import type React from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Download, Filter, Calendar, User, MoreHorizontal } from "lucide-react"
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
}

interface MedicalRecord {
  id: string
  patientId: string
  patient: {
    id: string
    name: string
  }
  recordType: string
  date: string
  title: string
  summary: string
  doctorName: string
  relatedItems?: string[]
}

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recordTypeFilter, setRecordTypeFilter] = useState("")
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recordForm, setRecordForm] = useState({
    patientId: "",
    recordType: "",
    title: "",
    summary: "",
    details: "",
    relatedItems: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch medical records
        const recordsResponse = await fetch("/api/medical-records")
        if (!recordsResponse.ok) {
          throw new Error("Failed to fetch medical records")
        }
        const recordsData = await recordsResponse.json()
        setRecords(recordsData)

        // Fetch patients for the form
        const patientsResponse = await fetch("/api/patients")
        if (!patientsResponse.ok) {
          throw new Error("Failed to fetch patients")
        }
        const patientsData = await patientsResponse.json()
        setPatients(patientsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load medical records",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setRecordForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRecordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitRecord = async () => {
    try {
      if (!recordForm.patientId || !recordForm.recordType || !recordForm.title) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: recordForm.patientId,
          recordType: recordForm.recordType,
          title: recordForm.title,
          summary: recordForm.summary,
          details: recordForm.details,
          relatedItems: recordForm.relatedItems ? recordForm.relatedItems.split(",").map((item) => item.trim()) : [],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add medical record")
      }

      toast({
        title: "Success",
        description: "Medical record has been added",
      })

      // Reset form and close dialog
      setRecordForm({
        patientId: "",
        recordType: "",
        title: "",
        summary: "",
        details: "",
        relatedItems: "",
      })
      setIsAddRecordOpen(false)

      // Refresh data
      const recordsResponse = await fetch("/api/medical-records")
      const recordsData = await recordsResponse.json()
      setRecords(recordsData)
    } catch (error) {
      console.error("Error adding medical record:", error)
      toast({
        title: "Error",
        description: "Failed to add medical record",
        variant: "destructive",
      })
    }
  }

  // Filter records based on search query and filters
  const filteredRecords = records.filter((record) => {
    // Search query filter
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary.toLowerCase().includes(searchQuery.toLowerCase())

    // Record type filter
    const matchesType = recordTypeFilter ? record.recordType === recordTypeFilter : true

    return matchesSearch && matchesType
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Get badge variant based on record type
  const getRecordTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "TRANSFUSION":
        return "default"
      case "DIAGNOSIS":
        return "secondary"
      case "FOLLOW_UP":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Format record type for display
  const formatRecordType = (type: string) => {
    return type.replace(/_/g, " ")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">Manage patient medical records</p>
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={recordForm.patientId}
                    onValueChange={(value) => handleSelectChange("patientId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.id} - {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recordType">Record Type</Label>
                  <Select
                    value={recordForm.recordType}
                    onValueChange={(value) => handleSelectChange("recordType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSFUSION">Transfusion</SelectItem>
                      <SelectItem value="DIAGNOSIS">Diagnosis</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                      <SelectItem value="TREATMENT">Treatment</SelectItem>
                      <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Record title" value={recordForm.title} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Brief summary of the medical record..."
                    value={recordForm.summary}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="details">Detailed Notes</Label>
                  <Textarea
                    id="details"
                    placeholder="Detailed medical notes..."
                    className="min-h-[100px]"
                    value={recordForm.details}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="relatedItems">Related Items (Optional)</Label>
                  <Input
                    id="relatedItems"
                    placeholder="Comma-separated IDs (e.g., T1001, BR-001-23)"
                    value={recordForm.relatedItems}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter IDs of related transfusions, blood requests, etc.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRecord}>Save Record</Button>
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
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="transfusions">Transfusions</TabsTrigger>
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {recordTypeFilter ? formatRecordType(recordTypeFilter) : "Record Type"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="TRANSFUSION">Transfusion</SelectItem>
                <SelectItem value="DIAGNOSIS">Diagnosis</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                <SelectItem value="TREATMENT">Treatment</SelectItem>
                <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No records found.
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
                                  <div className="text-xs text-muted-foreground">{record.patientId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRecordTypeBadgeVariant(record.recordType)}>
                                {formatRecordType(record.recordType)}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(record.date)}
                              </div>
                            </TableCell>
                            <TableCell>{record.doctorName}</TableCell>
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
                                    <Link href={`/dashboard/medical-records/${record.id}`}>View Record</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/medical-records/${record.id}/edit`}>Edit Record</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/patients/${record.patientId}`}>View Patient</Link>
                                  </DropdownMenuItem>
                                  {record.recordType === "TRANSFUSION" &&
                                    record.relatedItems &&
                                    record.relatedItems.length > 0 && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/transfusions/${record.relatedItems[0]}`}>
                                            View Transfusion
                                          </Link>
                                        </DropdownMenuItem>
                                      </>
                                    )}
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

            <TabsContent value="transfusions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transfusion Records</CardTitle>
                  <CardDescription>Medical records related to blood transfusions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Related Items</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords
                        .filter((record) => record.recordType === "TRANSFUSION")
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {record.patient.name}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.summary}</TableCell>
                            <TableCell>
                              {record.relatedItems && (
                                <div className="flex flex-wrap gap-1">
                                  {record.relatedItems.map((item, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/medical-records/${record.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnoses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis Records</CardTitle>
                  <CardDescription>Medical records related to patient diagnoses</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords
                        .filter((record) => record.recordType === "DIAGNOSIS")
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {record.patient.name}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.title}</TableCell>
                            <TableCell>{record.summary}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/medical-records/${record.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="follow-ups" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Records</CardTitle>
                  <CardDescription>Medical records related to patient follow-ups</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords
                        .filter((record) => record.recordType === "FOLLOW_UP")
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {record.patient.name}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.title}</TableCell>
                            <TableCell>{record.summary}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/medical-records/${record.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

