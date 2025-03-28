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

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recordTypeFilter, setRecordTypeFilter] = useState("")
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)

  // Mock data for medical records
  const records = [
    {
      id: "MR-001-23",
      patientId: "P12345",
      patientName: "John Doe",
      recordType: "TRANSFUSION",
      date: "2023-06-10T14:30:00Z",
      title: "Blood Transfusion Record",
      summary: "Patient received 2 units of A+ blood for anemia treatment",
      doctorName: "Dr. James Mwakasege",
      relatedItems: ["T1001", "BR-001-23"],
    },
    {
      id: "MR-002-23",
      patientId: "P12350",
      patientName: "Sarah Williams",
      recordType: "TRANSFUSION",
      date: "2023-06-07T16:45:00Z",
      title: "Blood Transfusion Record",
      summary: "Patient received 3 units of A- blood for sickle cell crisis",
      doctorName: "Dr. James Mwakasege",
      relatedItems: ["T1002", "BR-003-23"],
    },
    {
      id: "MR-003-23",
      patientId: "P12345",
      patientName: "John Doe",
      recordType: "DIAGNOSIS",
      date: "2023-06-01T10:15:00Z",
      title: "Anemia Diagnosis",
      summary: "Patient diagnosed with iron deficiency anemia. Hemoglobin 6.5 g/dL",
      doctorName: "Dr. James Mwakasege",
    },
    {
      id: "MR-004-23",
      patientId: "P12347",
      patientName: "Robert Johnson",
      recordType: "DIAGNOSIS",
      date: "2023-06-05T11:30:00Z",
      title: "Gastrointestinal Bleeding Diagnosis",
      summary: "Patient diagnosed with upper GI bleeding. Hemoglobin 8.2 g/dL",
      doctorName: "Dr. James Mwakasege",
    },
    {
      id: "MR-005-23",
      patientId: "P12350",
      patientName: "Sarah Williams",
      recordType: "FOLLOW_UP",
      date: "2023-06-12T09:00:00Z",
      title: "Post-Transfusion Follow-up",
      summary: "Patient showing improvement after transfusion. Hemoglobin increased to 9.8 g/dL",
      doctorName: "Dr. Emily Davis",
    },
  ]

  // Filter records based on search query and filters
  const filteredRecords = records.filter((record) => {
    // Search query filter
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary.toLowerCase().includes(searchQuery.toLowerCase())

    // Record type filter
    const matchesType = recordTypeFilter ? record.recordType === recordTypeFilter : true

    return matchesSearch && matchesType
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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
                  <Label htmlFor="patient-id">Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P12345">P12345 - John Doe</SelectItem>
                      <SelectItem value="P12347">P12347 - Robert Johnson</SelectItem>
                      <SelectItem value="P12350">P12350 - Sarah Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="record-type">Record Type</Label>
                  <Select>
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
                  <Input id="title" placeholder="Record title" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" placeholder="Brief summary of the medical record..." />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="details">Detailed Notes</Label>
                  <Textarea id="details" placeholder="Detailed medical notes..." className="min-h-[100px]" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="related-items">Related Items (Optional)</Label>
                  <Input id="related-items" placeholder="Comma-separated IDs (e.g., T1001, BR-001-23)" />
                  <p className="text-xs text-muted-foreground">
                    Enter IDs of related transfusions, blood requests, etc.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddRecordOpen(false)}>Save Record</Button>
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
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TRANSFUSION">Transfusion</SelectItem>
                <SelectItem value="DIAGNOSIS">Diagnosis</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
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
                              <div>{record.patientName}</div>
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
                              {record.recordType === "TRANSFUSION" && record.relatedItems && (
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
                            {record.patientName}
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
                            {record.patientName}
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
                            {record.patientName}
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
      </Tabs>
    </div>
  )
}

