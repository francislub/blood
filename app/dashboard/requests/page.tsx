"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Download,
  Filter,
  Calendar,
  User,
  Droplet,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

export default function BloodRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Mock data for blood requests
  const requests = [
    {
      id: "BR-001-23",
      patientId: "P12345",
      patientName: "John Doe",
      bloodType: "A_POSITIVE",
      units: 2,
      priority: "EMERGENCY",
      status: "APPROVED",
      requestDate: "2023-06-10T08:30:00Z",
      requester: "Dr. James Mwakasege",
      approver: "Dr. Sarah Kimaro",
      reason: "Anemia, Hb 6.5 g/dL",
    },
    {
      id: "BR-002-23",
      patientId: "P12347",
      patientName: "Robert Johnson",
      bloodType: "B_POSITIVE",
      units: 1,
      priority: "URGENT",
      status: "PENDING",
      requestDate: "2023-06-10T10:15:00Z",
      requester: "Dr. James Mwakasege",
      reason: "Gastrointestinal bleeding",
    },
    {
      id: "BR-003-23",
      patientId: "P12350",
      patientName: "Sarah Williams",
      bloodType: "A_NEGATIVE",
      units: 3,
      priority: "URGENT",
      status: "APPROVED",
      requestDate: "2023-06-07T14:45:00Z",
      requester: "Dr. James Mwakasege",
      approver: "Dr. Sarah Kimaro",
      reason: "Sickle cell crisis",
    },
    {
      id: "BR-004-23",
      patientId: "P12348",
      patientName: "Emily Davis",
      bloodType: "AB_POSITIVE",
      units: 2,
      priority: "STANDARD",
      status: "PENDING",
      requestDate: "2023-06-09T09:20:00Z",
      requester: "Dr. Sarah Kimaro",
      reason: "Pregnancy complications, scheduled C-section",
    },
    {
      id: "BR-005-23",
      patientId: "P12351",
      patientName: "David Wilson",
      bloodType: "O_NEGATIVE",
      units: 2,
      priority: "EMERGENCY",
      status: "REJECTED",
      requestDate: "2023-06-08T16:10:00Z",
      requester: "Dr. Emily Davis",
      approver: "Dr. Sarah Kimaro",
      reason: "Trauma, insufficient inventory",
      notes: "Redirected to Regional Blood Center",
    },
  ]

  // Filter requests based on search query and filters
  const filteredRequests = requests.filter((request) => {
    // Search query filter
    const matchesSearch =
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase())

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? request.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter ? request.status === statusFilter : true

    return matchesSearch && matchesBloodType && matchesStatus
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

  // Get badge variant based on priority
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "destructive"
      case "URGENT":
        return "warning"
      case "STANDARD":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success"
      case "PENDING":
        return "warning"
      case "REJECTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="mr-1 h-4 w-4" />
      case "PENDING":
        return <Clock className="mr-1 h-4 w-4" />
      case "REJECTED":
        return <XCircle className="mr-1 h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blood Requests</h1>
          <p className="text-muted-foreground">Manage and process blood transfusion requests</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
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
                    <TableHead>Request ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{request.patientName}</div>
                              <div className="text-xs text-muted-foreground">{request.patientId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(request.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.units} units</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(request.priority)}>{request.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(request.status)}
                            <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(request.requestDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/requests/${request.id}`}>View</Link>
                          </Button>
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
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Blood requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests
                    .filter((request) => request.status === "PENDING")
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{request.patientName}</div>
                              <div className="text-xs text-muted-foreground">{request.patientId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(request.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.units} units</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(request.priority)}>{request.priority}</Badge>
                        </TableCell>
                        <TableCell>{request.requester}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(request.requestDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/requests/${request.id}/process`}>Process</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/requests/${request.id}`}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Requests</CardTitle>
              <CardDescription>High priority blood requests</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.filter((request) => request.priority === "EMERGENCY").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No emergency requests at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests
                    .filter((request) => request.priority === "EMERGENCY")
                    .map((request) => (
                      <div key={request.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div className="font-medium">
                              {request.id} - {request.patientName}
                            </div>
                            <Badge variant="destructive">EMERGENCY</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === "PENDING" ? (
                              <Button size="sm" asChild>
                                <Link href={`/dashboard/requests/${request.id}/process`}>Process Now</Link>
                              </Button>
                            ) : (
                              <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Patient ID:</span> {request.patientId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(request.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Units Requested:</span> {request.units}
                          </div>
                          <div>
                            <span className="font-medium">Requested By:</span> {request.requester}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Requested At:</span> {formatDate(request.requestDate)}
                          </div>
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

