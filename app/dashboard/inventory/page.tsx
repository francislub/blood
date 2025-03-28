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
import { Search, Plus, Download, Filter, Calendar, AlertTriangle, FlaskRoundIcon as Flask, Droplet } from "lucide-react"

export default function InventoryPage() {
  const [bloodUnits, setBloodUnits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // This is just mock data for demonstration
    const mockBloodUnits = [
      {
        id: "1",
        unitNumber: "BU-001-23",
        bloodType: "A_POSITIVE",
        collectionDate: "2023-05-15",
        expiryDate: "2023-06-15",
        status: "AVAILABLE",
        donorName: "John Doe",
        volume: 450,
        technicianName: "Sarah Williams",
      },
      {
        id: "2",
        unitNumber: "BU-002-23",
        bloodType: "O_NEGATIVE",
        collectionDate: "2023-05-16",
        expiryDate: "2023-06-16",
        status: "AVAILABLE",
        donorName: "Jane Smith",
        volume: 450,
        technicianName: "Sarah Williams",
      },
      {
        id: "3",
        unitNumber: "BU-003-23",
        bloodType: "B_POSITIVE",
        collectionDate: "2023-05-10",
        expiryDate: "2023-06-10",
        status: "RESERVED",
        donorName: "Robert Johnson",
        volume: 450,
        technicianName: "Michael Brown",
      },
      {
        id: "4",
        unitNumber: "BU-004-23",
        bloodType: "AB_POSITIVE",
        collectionDate: "2023-04-20",
        expiryDate: "2023-05-20",
        status: "EXPIRED",
        donorName: "Emily Davis",
        volume: 450,
        technicianName: "Michael Brown",
      },
      {
        id: "5",
        unitNumber: "BU-005-23",
        bloodType: "A_NEGATIVE",
        collectionDate: "2023-05-05",
        expiryDate: "2023-06-05",
        status: "USED",
        donorName: "Michael Brown",
        volume: 450,
        technicianName: "Sarah Williams",
        patientName: "Alice Johnson",
        usedDate: "2023-05-20",
      },
      {
        id: "6",
        unitNumber: "BU-006-23",
        bloodType: "O_POSITIVE",
        collectionDate: "2023-06-01",
        expiryDate: "2023-07-01",
        status: "AVAILABLE",
        donorName: "David Wilson",
        volume: 450,
        technicianName: "Michael Brown",
      },
      {
        id: "7",
        unitNumber: "BU-007-23",
        bloodType: "B_NEGATIVE",
        collectionDate: "2023-06-02",
        expiryDate: "2023-07-02",
        status: "AVAILABLE",
        donorName: "Sophia Martinez",
        volume: 450,
        technicianName: "Sarah Williams",
      },
      {
        id: "8",
        unitNumber: "BU-008-23",
        bloodType: "AB_NEGATIVE",
        collectionDate: "2023-05-25",
        expiryDate: "2023-06-25",
        status: "AVAILABLE",
        donorName: "James Taylor",
        volume: 450,
        technicianName: "Michael Brown",
      },
    ]

    // Simulate API call
    setTimeout(() => {
      setBloodUnits(mockBloodUnits)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper function to format blood type for display
  const formatBloodType = (type) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Helper function to check if blood unit is expiring soon (within 7 days)
  const isExpiringSoon = (unit) => {
    if (unit.status !== "AVAILABLE") return false
    const expiryDate = new Date(unit.expiryDate)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  // Filter blood units based on search query and filters
  const filteredBloodUnits = bloodUnits.filter((unit) => {
    // Search query filter
    const matchesSearch =
      unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.patientName && unit.patientName.toLowerCase().includes(searchQuery.toLowerCase()))

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? unit.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter ? unit.status === statusFilter : true

    return matchesSearch && matchesBloodType && matchesStatus
  })

  // Get counts for each blood type
  const getBloodTypeCounts = () => {
    const counts = {}
    bloodUnits.forEach((unit) => {
      if (unit.status === "AVAILABLE") {
        if (!counts[unit.bloodType]) {
          counts[unit.bloodType] = 0
        }
        counts[unit.bloodType]++
      }
    })
    return counts
  }

  const bloodTypeCounts = getBloodTypeCounts()

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "success"
      case "RESERVED":
        return "warning"
      case "USED":
        return "default"
      case "EXPIRED":
        return "destructive"
      case "DISCARDED":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blood Inventory</h1>
          <p className="text-muted-foreground">Manage blood units and inventory</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Blood Unit
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(bloodTypeCounts).map(([bloodType, count]) => (
          <Card key={bloodType}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{formatBloodType(bloodType)}</CardTitle>
              <Flask className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count} units</div>
              <p className="text-xs text-muted-foreground">Available for transfusion</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <TabsList>
            <TabsTrigger value="all">All Units</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search units..."
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
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="USED">Used</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="DISCARDED">Discarded</SelectItem>
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
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBloodUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No blood units found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBloodUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Flask className="h-4 w-4 text-muted-foreground" />
                              {unit.unitNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(unit.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(unit.collectionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(unit.expiryDate).toLocaleDateString()}
                              {isExpiringSoon(unit) && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(unit.status)}>{unit.status}</Badge>
                          </TableCell>
                          <TableCell>{unit.donorName}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/inventory/${unit.id}`}>View</Link>
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

        <TabsContent value="available" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Blood Units</CardTitle>
              <CardDescription>Blood units that are available for transfusion</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBloodUnits
                      .filter((unit) => unit.status === "AVAILABLE")
                      .map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Flask className="h-4 w-4 text-muted-foreground" />
                              {unit.unitNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(unit.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(unit.collectionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(unit.expiryDate).toLocaleDateString()}
                              {isExpiringSoon(unit) && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell>{unit.donorName}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/inventory/${unit.id}/allocate`}>Allocate</Link>
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

        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Blood units that will expire within 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBloodUnits
                      .filter((unit) => isExpiringSoon(unit))
                      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                      .map((unit) => {
                        const expiryDate = new Date(unit.expiryDate)
                        const today = new Date()
                        const diffTime = expiryDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        return (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Flask className="h-4 w-4 text-muted-foreground" />
                                {unit.unitNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium text-primary">
                                {formatBloodType(unit.bloodType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(unit.collectionDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(unit.expiryDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={diffDays <= 3 ? "destructive" : "warning"}>
                                {diffDays} {diffDays === 1 ? "day" : "days"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" asChild>
                                  <Link href={`/dashboard/inventory/${unit.id}/allocate`}>Allocate</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/dashboard/inventory/${unit.id}`}>View</Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

