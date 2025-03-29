"use client"

import { useState, useEffect } from "react"
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
  Download,
  Filter,
  Calendar,
  User,
  Droplet,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transfusion {
  id: string
  patientId: string
  patient: {
    id: string
    name: string
  }
  bloodType: string
  units: number
  status: string
  date: string
  doctor: string
  technician?: {
    id: string
    user: {
      name: string
    }
  }
  requestId: string
  notes?: string
}

export default function TransfusionsPage() {
  const [transfusions, setTransfusions] = useState<Transfusion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransfusions = async () => {
      try {
        const response = await fetch("/api/transfusions")
        if (!response.ok) {
          throw new Error("Failed to fetch transfusions")
        }
        const data = await response.json()
        setTransfusions(data)
      } catch (error) {
        console.error("Error fetching transfusions:", error)
        toast({
          title: "Error",
          description: "Failed to load transfusion data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransfusions()
  }, [toast])

  // Filter transfusions based on search query and filters
  const filteredTransfusions = transfusions.filter((transfusion) => {
    // Search query filter
    const matchesSearch =
      transfusion.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfusion.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfusion.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfusion.notes && transfusion.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? transfusion.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter ? transfusion.status === statusFilter : true

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
        return <Calendar className="mr-1 h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Transfusions</h1>
          <p className="text-muted-foreground">Manage and track blood transfusions</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <TabsList>
            <TabsTrigger value="all">All Transfusions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transfusions..."
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
                <SelectItem value="all">All Types</SelectItem>
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
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfusion ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfusions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No transfusions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransfusions.map((transfusion) => (
                        <TableRow key={transfusion.id}>
                          <TableCell className="font-medium">{transfusion.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{transfusion.patient.name}</div>
                                <div className="text-xs text-muted-foreground">{transfusion.patientId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(transfusion.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transfusion.units} units</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(transfusion.status)}
                              <Badge variant={getStatusBadgeVariant(transfusion.status)}>{transfusion.status}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(transfusion.date)}
                            </div>
                          </TableCell>
                          <TableCell>{transfusion.doctor}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/transfusions/${transfusion.id}`}>View</Link>
                            </Button>
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

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transfusions</CardTitle>
              <CardDescription>Successfully completed blood transfusions</CardDescription>
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
                      <TableHead>Transfusion ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfusions
                      .filter((transfusion) => transfusion.status === "COMPLETED")
                      .map((transfusion) => (
                        <TableRow key={transfusion.id}>
                          <TableCell className="font-medium">{transfusion.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{transfusion.patient.name}</div>
                                <div className="text-xs text-muted-foreground">{transfusion.patientId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(transfusion.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transfusion.units} units</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(transfusion.date)}
                            </div>
                          </TableCell>
                          <TableCell>{transfusion.doctor}</TableCell>
                          <TableCell>{transfusion.technician?.user.name || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/transfusions/${transfusion.id}`}>View</Link>
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

        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Transfusions</CardTitle>
              <CardDescription>Upcoming blood transfusions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredTransfusions.filter((transfusion) => transfusion.status === "SCHEDULED").length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No scheduled transfusions at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransfusions
                    .filter((transfusion) => transfusion.status === "SCHEDULED")
                    .map((transfusion) => (
                      <div key={transfusion.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <div className="font-medium">
                              {transfusion.id} - {transfusion.patient.name}
                            </div>
                            <Badge variant="warning">SCHEDULED</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/transfusions/${transfusion.id}/record`}>Record Transfusion</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Patient ID:</span> {transfusion.patientId}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {formatBloodType(transfusion.bloodType)}
                          </div>
                          <div>
                            <span className="font-medium">Units:</span> {transfusion.units}
                          </div>
                          <div>
                            <span className="font-medium">Doctor:</span> {transfusion.doctor}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Scheduled For:</span> {formatDate(transfusion.date)}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Request ID:</span> {transfusion.requestId}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/requests/${transfusion.requestId}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Request
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/patients/${transfusion.patientId}`}>
                              <User className="mr-2 h-4 w-4" />
                              View Patient
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

