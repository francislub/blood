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
import { Search, Plus, Download, Filter, CheckSquare, User, XCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DonorScreeningPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddScreeningOpen, setIsAddScreeningOpen] = useState(false)

  // Mock data for donor screenings
  const screenings = [
    {
      id: "DS-001-23",
      donorId: "1",
      donorName: "John Doe",
      bloodType: "A_POSITIVE",
      status: "ELIGIBLE",
      date: "2023-06-10T08:30:00Z",
      vitals: {
        temperature: "36.7°C",
        pulse: "72 bpm",
        bloodPressure: "120/80 mmHg",
        weight: "75 kg",
        hemoglobin: "14.2 g/dL",
      },
      doctorName: "Dr. James Mwakasege",
      notes: "Donor is in good health, eligible to donate",
    },
    {
      id: "DS-002-23",
      donorId: "2",
      donorName: "Jane Smith",
      bloodType: "O_NEGATIVE",
      status: "ELIGIBLE",
      date: "2023-06-09T10:15:00Z",
      vitals: {
        temperature: "36.5°C",
        pulse: "68 bpm",
        bloodPressure: "110/70 mmHg",
        weight: "65 kg",
        hemoglobin: "13.8 g/dL",
      },
      doctorName: "Dr. Emily Davis",
      notes: "Donor is in good health, eligible to donate",
    },
    {
      id: "DS-003-23",
      donorId: "3",
      donorName: "Robert Johnson",
      bloodType: "B_POSITIVE",
      status: "PENDING",
      scheduledDate: "2023-06-15T09:00:00Z",
    },
    {
      id: "DS-004-23",
      donorId: "5",
      donorName: "Michael Brown",
      bloodType: "A_NEGATIVE",
      status: "PENDING",
      scheduledDate: "2023-06-16T13:30:00Z",
    },
    {
      id: "DS-005-23",
      donorId: "4",
      donorName: "Emily Davis",
      bloodType: "AB_POSITIVE",
      status: "DEFERRED",
      date: "2023-06-08T11:30:00Z",
      vitals: {
        temperature: "37.2°C",
        pulse: "82 bpm",
        bloodPressure: "130/85 mmHg",
        weight: "58 kg",
        hemoglobin: "11.8 g/dL",
      },
      doctorName: "Dr. James Mwakasege",
      deferralReason: "Low hemoglobin level",
      deferralPeriod: "3 months",
      notes: "Donor advised to take iron supplements and return after 3 months",
    },
  ]

  // Filter screenings based on search query and filters
  const filteredScreenings = screenings.filter((screening) => {
    // Search query filter
    const matchesSearch =
      screening.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screening.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screening.donorId.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter ? screening.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ELIGIBLE":
        return "success"
      case "PENDING":
        return "warning"
      case "DEFERRED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donor Screening</h1>
          <p className="text-muted-foreground">Manage donor eligibility screenings</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddScreeningOpen} onOpenChange={setIsAddScreeningOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Screening
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record Donor Screening</DialogTitle>
                <DialogDescription>Enter donor screening results and eligibility assessment</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="donor-id">Donor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Robert Johnson (B+)</SelectItem>
                      <SelectItem value="5">Michael Brown (A-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium">Vital Signs</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input id="temperature" type="number" step="0.1" defaultValue="36.7" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pulse">Pulse (bpm)</Label>
                      <Input id="pulse" type="number" defaultValue="72" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="blood-pressure">Blood Pressure (mmHg)</Label>
                      <Input id="blood-pressure" placeholder="120/80" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input id="weight" type="number" step="0.1" defaultValue="70" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input id="hemoglobin" type="number" step="0.1" defaultValue="14.0" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="questionnaire">Questionnaire Completed</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Eligibility Status</Label>
                  <Select defaultValue="ELIGIBLE">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                      <SelectItem value="DEFERRED">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deferral-reason">Deferral Reason (if applicable)</Label>
                  <Input id="deferral-reason" placeholder="Reason for deferral" disabled />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deferral-period">Deferral Period (if applicable)</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-months">3 Months</SelectItem>
                      <SelectItem value="6-months">6 Months</SelectItem>
                      <SelectItem value="12-months">12 Months</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the screening..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddScreeningOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddScreeningOpen(false)}>Save Results</Button>
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
            <TabsTrigger value="all">All Screenings</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="eligible">Eligible</TabsTrigger>
            <TabsTrigger value="deferred">Deferred</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search screenings..."
                className="w-full pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter ? statusFilter : "Status"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DEFERRED">Deferred</SelectItem>
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
                    <TableHead>Screening ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScreenings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No screenings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredScreenings.map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell className="font-medium">{screening.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{screening.donorName}</div>
                              <div className="text-xs text-muted-foreground">Donor #{screening.donorId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(screening.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(screening.status)}>{screening.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {screening.date ? (
                            formatDate(screening.date)
                          ) : screening.scheduledDate ? (
                            <span className="text-muted-foreground">
                              Scheduled: {formatDate(screening.scheduledDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>{screening.doctorName || "-"}</TableCell>
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
                                <Link href={`/dashboard/donor-screening/${screening.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {screening.status === "PENDING" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/donor-screening/${screening.id}/record`}>
                                    Record Screening
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/donors/${screening.donorId}`}>View Donor</Link>
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

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Screenings</CardTitle>
              <CardDescription>Donors awaiting eligibility screening</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredScreenings.filter((screening) => screening.status === "PENDING").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No pending screenings at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredScreenings
                    .filter((screening) => screening.status === "PENDING")
                    .map((screening) => (
                      <div key={screening.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-primary" />
                            <div className="font-medium">
                              {screening.id} - {screening.donorName}
                            </div>
                            <Badge variant="warning">PENDING</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/donor-screening/${screening.id}/record`}>Record Screening</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Donor ID:</span> #{screening.donorId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(screening.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Scheduled Date:</span> {formatDate(screening.scheduledDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligible" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligible Donors</CardTitle>
              <CardDescription>Donors who passed eligibility screening</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Screening ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vitals</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScreenings
                    .filter((screening) => screening.status === "ELIGIBLE")
                    .map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell className="font-medium">{screening.id}</TableCell>
                        <TableCell>{screening.donorName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(screening.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(screening.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <div>Hb: {screening.vitals.hemoglobin}</div>
                            <div>BP: {screening.vitals.bloodPressure}</div>
                          </div>
                        </TableCell>
                        <TableCell>{screening.doctorName}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/donor-screening/${screening.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deferred" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deferred Donors</CardTitle>
              <CardDescription>Donors who are temporarily or permanently deferred</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredScreenings.filter((screening) => screening.status === "DEFERRED").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No deferred donors found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredScreenings
                    .filter((screening) => screening.status === "DEFERRED")
                    .map((screening) => (
                      <div
                        key={screening.id}
                        className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div className="font-medium">
                              {screening.id} - {screening.donorName}
                            </div>
                            <Badge variant="destructive">DEFERRED</Badge>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Donor ID:</span> #{screening.donorId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(screening.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Screening Date:</span> {formatDate(screening.date)}
                          </div>
                          <div>
                            <span className="font-medium">Doctor:</span> {screening.doctorName}
                          </div>
                          <div>
                            <span className="font-medium">Deferral Reason:</span> {screening.deferralReason}
                          </div>
                          <div>
                            <span className="font-medium">Deferral Period:</span> {screening.deferralPeriod}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Notes:</span> {screening.notes}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/donor-screening/${screening.id}`}>View Full Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

