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
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DonationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Mock data for donations
  const donations = [
    {
      id: "D1001",
      donorId: "1",
      donorName: "John Doe",
      bloodType: "A_POSITIVE",
      status: "COMPLETED",
      date: "2023-06-10T09:30:00Z",
      units: 1,
      technicianName: "Nurse Mary Mushi",
      eligibleNextDate: "2023-08-05",
    },
    {
      id: "D1002",
      donorId: "2",
      donorName: "Jane Smith",
      bloodType: "O_NEGATIVE",
      status: "COMPLETED",
      date: "2023-06-09T11:15:00Z",
      units: 1,
      technicianName: "Nurse Mary Mushi",
      eligibleNextDate: "2023-08-04",
    },
    {
      id: "D1003",
      donorId: "3",
      donorName: "Robert Johnson",
      bloodType: "B_POSITIVE",
      status: "SCHEDULED",
      date: "2023-06-15T10:00:00Z",
      units: 1,
    },
    {
      id: "D1004",
      donorId: "5",
      donorName: "Michael Brown",
      bloodType: "A_NEGATIVE",
      status: "SCHEDULED",
      date: "2023-06-16T14:30:00Z",
      units: 1,
    },
    {
      id: "D1005",
      donorId: "4",
      donorName: "Emily Davis",
      bloodType: "AB_POSITIVE",
      status: "CANCELLED",
      date: "2023-06-12T13:00:00Z",
      units: 1,
      cancellationReason: "Donor illness",
    },
  ]

  // Filter donations based on search query and filters
  const filteredDonations = donations.filter((donation) => {
    // Search query filter
    const matchesSearch =
      donation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorId.toLowerCase().includes(searchQuery.toLowerCase())

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? donation.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter ? donation.status === statusFilter : true

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

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success"
      case "SCHEDULED":
        return "warning"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="mr-1 h-4 w-4" />
      case "SCHEDULED":
        return <Clock className="mr-1 h-4 w-4" />
      case "CANCELLED":
        return <XCircle className="mr-1 h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">Manage blood donations and appointments</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/donations/schedule">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Donation
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
            <TabsTrigger value="all">All Donations</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search donations..."
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
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                    <TableHead>Donation ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No donations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{donation.donorName}</div>
                              <div className="text-xs text-muted-foreground">Donor #{donation.donorId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(donation.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(donation.status)}
                            <Badge variant={getStatusBadgeVariant(donation.status)}>{donation.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(donation.date)}
                          </div>
                        </TableCell>
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
                                <Link href={`/dashboard/donations/${donation.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {donation.status === "SCHEDULED" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/donations/${donation.id}/process`}>Process Donation</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/donations/${donation.id}/cancel`}>Cancel Donation</Link>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/donors/${donation.donorId}`}>View Donor</Link>
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

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Donations</CardTitle>
              <CardDescription>Successfully completed blood donations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donation ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Next Eligible Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations
                    .filter((donation) => donation.status === "COMPLETED")
                    .map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {donation.donorName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(donation.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(donation.date)}
                          </div>
                        </TableCell>
                        <TableCell>{donation.technicianName}</TableCell>
                        <TableCell>
                          {donation.eligibleNextDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(donation.eligibleNextDate).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/donations/${donation.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Donations</CardTitle>
              <CardDescription>Upcoming blood donation appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDonations.filter((donation) => donation.status === "SCHEDULED").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No scheduled donations at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDonations
                    .filter((donation) => donation.status === "SCHEDULED")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((donation) => (
                      <div key={donation.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <div className="font-medium">
                              {donation.id} - {donation.donorName}
                            </div>
                            <Badge variant="warning">SCHEDULED</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/donations/${donation.id}/process`}>Process Donation</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Donor ID:</span> #{donation.donorId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(donation.bloodType)}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Scheduled For:</span> {formatDate(donation.date)}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/donors/${donation.donorId}`}>
                              <User className="mr-2 h-4 w-4" />
                              View Donor
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/donations/${donation.id}/cancel`}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </Link>
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

