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
import { Search, Plus, Download, Filter, Layers, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ComponentSeparationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddSeparationOpen, setIsAddSeparationOpen] = useState(false)

  // Mock data for component separations
  const separations = [
    {
      id: "CS-001-23",
      donationId: "D1001",
      donorName: "John Doe",
      bloodType: "A_POSITIVE",
      status: "COMPLETED",
      date: "2023-06-10T13:30:00Z",
      components: [
        { type: "RED_CELLS", volume: "280 ml", expiryDate: "2023-07-22" },
        { type: "PLASMA", volume: "200 ml", expiryDate: "2023-12-10" },
        { type: "PLATELETS", volume: "50 ml", expiryDate: "2023-06-15" },
      ],
      technicianName: "Michael Brown",
      notes: "Standard triple bag separation",
    },
    {
      id: "CS-002-23",
      donationId: "D1002",
      donorName: "Jane Smith",
      bloodType: "O_NEGATIVE",
      status: "COMPLETED",
      date: "2023-06-09T15:45:00Z",
      components: [
        { type: "RED_CELLS", volume: "270 ml", expiryDate: "2023-07-21" },
        { type: "PLASMA", volume: "210 ml", expiryDate: "2023-12-09" },
      ],
      technicianName: "Michael Brown",
      notes: "Double bag separation, no platelets",
    },
    {
      id: "CS-003-23",
      donationId: "D1003",
      donorName: "Robert Johnson",
      bloodType: "B_POSITIVE",
      status: "PENDING",
      scheduledDate: "2023-06-15T14:00:00Z",
    },
    {
      id: "CS-004-23",
      donationId: "D1004",
      donorName: "Michael Brown",
      bloodType: "A_NEGATIVE",
      status: "PENDING",
      scheduledDate: "2023-06-16T17:30:00Z",
    },
    {
      id: "CS-005-23",
      donationId: "D1006",
      donorName: "Sarah Williams",
      bloodType: "A_POSITIVE",
      status: "CANCELLED",
      date: "2023-06-08T14:30:00Z",
      notes: "Cancelled due to positive test results",
    },
  ]

  // Filter separations based on search query and filters
  const filteredSeparations = separations.filter((separation) => {
    // Search query filter
    const matchesSearch =
      separation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      separation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      separation.donationId.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter ? separation.status === statusFilter : true

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

  // Format component type for display
  const formatComponentType = (type: string) => {
    return type.replace(/_/g, " ")
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success"
      case "PENDING":
        return "warning"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Component Separation</h1>
          <p className="text-muted-foreground">Process blood donations into separate components</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddSeparationOpen} onOpenChange={setIsAddSeparationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Separation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record Component Separation</DialogTitle>
                <DialogDescription>Enter details for blood component separation</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="donation-id">Donation ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="D1003">D1003 - Robert Johnson (B+)</SelectItem>
                      <SelectItem value="D1004">D1004 - Michael Brown (A-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Components to Separate</Label>
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="red-cells"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="red-cells" className="text-sm font-normal">
                        Red Blood Cells
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="plasma" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                      <Label htmlFor="plasma" className="text-sm font-normal">
                        Plasma
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="platelets"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="platelets" className="text-sm font-normal">
                        Platelets
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cryoprecipitate" className="h-4 w-4 rounded border-gray-300" />
                      <Label htmlFor="cryoprecipitate" className="text-sm font-normal">
                        Cryoprecipitate
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="red-cells-volume">Red Cells Volume (ml)</Label>
                    <Input id="red-cells-volume" type="number" defaultValue="280" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plasma-volume">Plasma Volume (ml)</Label>
                    <Input id="plasma-volume" type="number" defaultValue="200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platelets-volume">Platelets Volume (ml)</Label>
                    <Input id="platelets-volume" type="number" defaultValue="50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cryo-volume">Cryoprecipitate Volume (ml)</Label>
                    <Input id="cryo-volume" type="number" defaultValue="0" disabled />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the separation process..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSeparationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddSeparationOpen(false)}>Save Record</Button>
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
            <TabsTrigger value="all">All Separations</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search separations..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
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
                    <TableHead>Separation ID</TableHead>
                    <TableHead>Donation</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSeparations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No separations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSeparations.map((separation) => (
                      <TableRow key={separation.id}>
                        <TableCell className="font-medium">{separation.id}</TableCell>
                        <TableCell>{separation.donationId}</TableCell>
                        <TableCell>{separation.donorName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(separation.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(separation.status)}>{separation.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {separation.date ? (
                            formatDate(separation.date)
                          ) : separation.scheduledDate ? (
                            <span className="text-muted-foreground">
                              Scheduled: {formatDate(separation.scheduledDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not scheduled</span>
                          )}
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
                                <Link href={`/dashboard/component-separation/${separation.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {separation.status === "PENDING" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/component-separation/${separation.id}/record`}>
                                    Record Separation
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/donations/${separation.donationId}`}>View Donation</Link>
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
              <CardTitle>Pending Separations</CardTitle>
              <CardDescription>Blood donations awaiting component separation</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSeparations.filter((separation) => separation.status === "PENDING").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No pending separations at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSeparations
                    .filter((separation) => separation.status === "PENDING")
                    .map((separation) => (
                      <div key={separation.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            <div className="font-medium">
                              {separation.id} - {separation.donorName}
                            </div>
                            <Badge variant="warning">PENDING</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/component-separation/${separation.id}/record`}>
                                Record Separation
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Donation ID:</span> {separation.donationId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(separation.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Scheduled Date:</span> {formatDate(separation.scheduledDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Separations</CardTitle>
              <CardDescription>Successfully completed component separations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Separation ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Components</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSeparations
                    .filter((separation) => separation.status === "COMPLETED")
                    .map((separation) => (
                      <TableRow key={separation.id}>
                        <TableCell className="font-medium">{separation.id}</TableCell>
                        <TableCell>{separation.donorName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(separation.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(separation.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {separation.components.map((component, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {formatComponentType(component.type)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{separation.technicianName}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/component-separation/${separation.id}`}>View</Link>
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

