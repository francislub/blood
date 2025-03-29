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
import { Search, Plus, Download, Filter, ShieldCheck, AlertTriangle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function QualityControlPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddQCOpen, setIsAddQCOpen] = useState(false)

  // Mock data for quality control checks
  const qcChecks = [
    {
      id: "QC-001-23",
      unitId: "BU-001-23",
      bloodType: "A_POSITIVE",
      componentType: "RED_CELLS",
      status: "PASSED",
      date: "2023-06-10T15:30:00Z",
      parameters: {
        volume: "280 ml",
        hematocrit: "75%",
        hemoglobin: "55 g/unit",
        hemolysis: "0.2%",
        sterility: "Passed",
      },
      technicianName: "Michael Brown",
      notes: "All parameters within acceptable range",
    },
    {
      id: "QC-002-23",
      unitId: "BU-002-23",
      bloodType: "O_NEGATIVE",
      componentType: "PLASMA",
      status: "PASSED",
      date: "2023-06-09T16:45:00Z",
      parameters: {
        volume: "210 ml",
        appearance: "Clear, no hemolysis",
        factor8: "0.85 IU/ml",
        sterility: "Passed",
      },
      technicianName: "Michael Brown",
      notes: "All parameters within acceptable range",
    },
    {
      id: "QC-003-23",
      unitId: "BU-003-23",
      bloodType: "B_POSITIVE",
      componentType: "PLATELETS",
      status: "PENDING",
      scheduledDate: "2023-06-15T15:00:00Z",
    },
    {
      id: "QC-004-23",
      unitId: "BU-004-23",
      bloodType: "A_NEGATIVE",
      componentType: "RED_CELLS",
      status: "PENDING",
      scheduledDate: "2023-06-16T18:30:00Z",
    },
    {
      id: "QC-005-23",
      unitId: "BU-005-23",
      bloodType: "A_POSITIVE",
      componentType: "RED_CELLS",
      status: "FAILED",
      date: "2023-06-08T14:30:00Z",
      parameters: {
        volume: "260 ml",
        hematocrit: "65%",
        hemoglobin: "45 g/unit",
        hemolysis: "0.8%",
        sterility: "Passed",
      },
      technicianName: "Michael Brown",
      notes: "Hemolysis exceeds acceptable limit of 0.6%, unit discarded",
    },
  ]

  // Filter QC checks based on search query and filters
  const filteredChecks = qcChecks.filter((check) => {
    // Search query filter
    const matchesSearch =
      check.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.componentType.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter ? check.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Format component type for display
  const formatComponentType = (type: string) => {
    return type.replace(/_/g, " ")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PASSED":
        return "success"
      case "PENDING":
        return "warning"
      case "FAILED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">Manage quality control checks for blood components</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddQCOpen} onOpenChange={setIsAddQCOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record QC Check
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record Quality Control Check</DialogTitle>
                <DialogDescription>Enter quality control parameters for a blood component</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="unit-id">Blood Unit ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BU-003-23">BU-003-23 (B+, RED CELLS)</SelectItem>
                      <SelectItem value="BU-004-23">BU-004-23 (A-, RED CELLS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="component-type">Component Type</Label>
                  <Select defaultValue="RED_CELLS">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RED_CELLS">Red Blood Cells</SelectItem>
                      <SelectItem value="PLASMA">Plasma</SelectItem>
                      <SelectItem value="PLATELETS">Platelets</SelectItem>
                      <SelectItem value="CRYOPRECIPITATE">Cryoprecipitate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium">Quality Parameters</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="volume">Volume (ml)</Label>
                      <Input id="volume" type="number" defaultValue="280" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hematocrit">Hematocrit (%)</Label>
                      <Input id="hematocrit" type="number" step="0.1" defaultValue="75" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hemoglobin">Hemoglobin (g/unit)</Label>
                      <Input id="hemoglobin" type="number" step="0.1" defaultValue="55" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hemolysis">Hemolysis (%)</Label>
                      <Input id="hemolysis" type="number" step="0.01" defaultValue="0.2" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sterility">Sterility</Label>
                    <Select defaultValue="PASSED">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSED">Passed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the quality control check..." />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Final Status</Label>
                  <Select defaultValue="PASSED">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Passed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddQCOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddQCOpen(false)}>Save Results</Button>
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
            <TabsTrigger value="all">All Checks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search QC checks..."
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
                <SelectItem value="PASSED">Passed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
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
                    <TableHead>QC ID</TableHead>
                    <TableHead>Unit ID</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No quality control checks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">{check.id}</TableCell>
                        <TableCell>{check.unitId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-primary">
                            {formatBloodType(check.bloodType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatComponentType(check.componentType)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(check.status)}>{check.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {check.date ? (
                            formatDate(check.date)
                          ) : check.scheduledDate ? (
                            <span className="text-muted-foreground">Scheduled: {formatDate(check.scheduledDate)}</span>
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
                                <Link href={`/dashboard/quality-control/${check.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {check.status === "PENDING" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/quality-control/${check.id}/record`}>Record Results</Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/inventory/${check.unitId}`}>View Blood Unit</Link>
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
              <CardTitle>Pending Checks</CardTitle>
              <CardDescription>Blood components awaiting quality control</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredChecks.filter((check) => check.status === "PENDING").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No pending quality control checks at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChecks
                    .filter((check) => check.status === "PENDING")
                    .map((check) => (
                      <div key={check.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <div className="font-medium">
                              {check.id} - {check.unitId}
                            </div>
                            <Badge variant="warning">PENDING</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/quality-control/${check.id}/record`}>Record Results</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(check.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Component:</span> {formatComponentType(check.componentType)}
                          </div>
                          <div>
                            <span className="font-medium">Scheduled Date:</span> {formatDate(check.scheduledDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Passed Checks</CardTitle>
              <CardDescription>Blood components that passed quality control</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QC ID</TableHead>
                    <TableHead>Unit ID</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks
                    .filter((check) => check.status === "PASSED")
                    .map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">{check.id}</TableCell>
                        <TableCell>{check.unitId}</TableCell>
                        <TableCell>{formatComponentType(check.componentType)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {check.parameters &&
                              Object.entries(check.parameters).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{" "}
                                  {value}
                                </div>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(check.date)}</TableCell>
                        <TableCell>{check.technicianName}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/quality-control/${check.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Checks</CardTitle>
              <CardDescription>Blood components that failed quality control</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredChecks.filter((check) => check.status === "FAILED").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No failed quality control checks found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChecks
                    .filter((check) => check.status === "FAILED")
                    .map((check) => (
                      <div
                        key={check.id}
                        className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div className="font-medium">
                              {check.id} - {check.unitId}
                            </div>
                            <Badge variant="destructive">FAILED</Badge>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(check.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Component:</span> {formatComponentType(check.componentType)}
                          </div>
                          <div>
                            <span className="font-medium">Test Date:</span> {formatDate(check.date)}
                          </div>
                          <div>
                            <span className="font-medium">Technician:</span> {check.technicianName}
                          </div>
                        </div>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="font-medium">Parameters:</div>
                          <div className="grid grid-cols-2 gap-2">
                            {check.parameters &&
                              Object.entries(check.parameters).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{" "}
                                  {value}
                                </div>
                              ))}
                          </div>
                          <div>
                            <span className="font-medium">Notes:</span> {check.notes}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/quality-control/${check.id}`}>View Full Details</Link>
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

