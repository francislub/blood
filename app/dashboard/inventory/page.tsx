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
  Search,
  Plus,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  FlaskRoundIcon as Flask,
  Droplet,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

interface BloodUnit {
  id: string
  unitNumber: string
  bloodType: string
  collectionDate: string
  expiryDate: string
  volume: number
  status: string
  donationId: string | null
  donor?: {
    id: string
    user: {
      name: string
      email: string
    }
  }
}

export default function InventoryPage() {
  // Client-side date formatter
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split("T")[0]
    } catch (e) {
      return "Invalid date"
    }
  }

  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [newUnit, setNewUnit] = useState({
    unitNumber: "",
    bloodType: "",
    collectionDate: "",
    expiryDate: "",
    volume: 450,
    donationId: "",
    status: "AVAILABLE",
  })
  const { toast } = useToast()

  // Move expiry calculations to client-side only
  const [expiringUnits, setExpiringUnits] = useState<BloodUnit[]>([])

  useEffect(() => {
    // Calculate expiring units on the client side only
    const expiring = bloodUnits.filter((unit) => {
      if (unit.status !== "AVAILABLE") return false
      const expiryDate = new Date(unit.expiryDate)
      const today = new Date()
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    })
    setExpiringUnits(expiring)
  }, [bloodUnits])

  // Fetch blood units from the database
  const fetchBloodUnits = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/blood-units")
      if (!response.ok) {
        throw new Error("Failed to fetch blood units")
      }
      const data = await response.json()
      setBloodUnits(data)
    } catch (error) {
      console.error("Error fetching blood units:", error)
      toast({
        title: "Error",
        description: "Failed to load blood inventory data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBloodUnits()
  }, [])

  // Add new blood unit
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/blood-units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUnit),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add blood unit")
      }

      toast({
        title: "Success",
        description: "Blood unit added successfully",
      })

      setIsAddUnitOpen(false)
      setNewUnit({
        unitNumber: "",
        bloodType: "",
        collectionDate: "",
        expiryDate: "",
        volume: 450,
        donationId: "",
        status: "AVAILABLE",
      })
      fetchBloodUnits()
    } catch (error) {
      console.error("Error adding blood unit:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Delete blood unit
  const handleDeleteUnit = async (id) => {
    if (!confirm("Are you sure you want to delete this blood unit?")) return

    try {
      const response = await fetch(`/api/blood-units/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete blood unit")
      }

      toast({
        title: "Success",
        description: "Blood unit deleted successfully",
      })

      fetchBloodUnits()
    } catch (error) {
      console.error("Error deleting blood unit:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Helper function to format blood type for display
  const formatBloodType = (type) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Helper function to check if blood unit is expiring soon (within 7 days)
  const isExpiringSoon = (unit: BloodUnit) => {
    if (unit.status !== "AVAILABLE") return false
    return expiringUnits.some((u) => u.id === unit.id)
  }

  // Filter blood units based on search query and filters
  const filteredBloodUnits = bloodUnits.filter((unit) => {
    // Search query filter
    const matchesSearch =
      unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.donor?.user?.name && unit.donor.user.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Blood type filter
    const matchesBloodType = bloodTypeFilter && bloodTypeFilter !== "ALL" ? unit.bloodType === bloodTypeFilter : true

    // Status filter
    const matchesStatus = statusFilter && statusFilter !== "ALL" ? unit.status === statusFilter : true

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

  // Calculate expiry date (35 days from collection date)
  const calculateExpiryDate = (collectionDate) => {
    if (!collectionDate) return ""
    const date = new Date(collectionDate)
    date.setDate(date.getDate() + 35) // Blood typically expires after 35 days
    return date.toISOString().split("T")[0]
  }

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    // Reset hours to avoid time zone issues
    expiry.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blood Inventory</h1>
          <p className="text-muted-foreground">Manage blood units and inventory</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Blood Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Blood Unit</DialogTitle>
                <DialogDescription>Enter the details for the new blood unit</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUnit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="unitNumber">Unit Number</Label>
                    <Input
                      id="unitNumber"
                      value={newUnit.unitNumber}
                      onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                      placeholder="BU-XXX-23"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select
                        value={newUnit.bloodType}
                        onValueChange={(value) => setNewUnit({ ...newUnit, bloodType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
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
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="volume">Volume (ml)</Label>
                      <Input
                        id="volume"
                        type="number"
                        value={newUnit.volume}
                        onChange={(e) => setNewUnit({ ...newUnit, volume: Number.parseInt(e.target.value) })}
                        min="100"
                        max="500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="collectionDate">Collection Date</Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={newUnit.collectionDate}
                        onChange={(e) => {
                          const collectionDate = e.target.value
                          const expiryDate = calculateExpiryDate(collectionDate)
                          setNewUnit({
                            ...newUnit,
                            collectionDate,
                            expiryDate,
                          })
                        }}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={newUnit.expiryDate}
                        onChange={(e) => setNewUnit({ ...newUnit, expiryDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newUnit.status}
                      onValueChange={(value) => setNewUnit({ ...newUnit, status: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="DISCARDED">Discarded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Blood Unit</Button>
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
                              {formatDate(unit.collectionDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(unit.expiryDate)}
                              {isExpiringSoon(unit) && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(unit.status)}>{unit.status}</Badge>
                          </TableCell>
                          <TableCell>{unit.donor?.user?.name || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/inventory/${unit.id}`}>View</Link>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUnit(unit.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
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
                              {formatDate(unit.collectionDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(unit.expiryDate)}
                              {isExpiringSoon(unit) && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell>{unit.donor?.user?.name || "N/A"}</TableCell>
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
                    {expiringUnits
                      .filter((unit) => {
                        // Apply the same search and filter logic as filteredBloodUnits
                        const matchesSearch =
                          unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (unit.donor?.user?.name &&
                            unit.donor.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        const matchesBloodType =
                          bloodTypeFilter && bloodTypeFilter !== "ALL" ? unit.bloodType === bloodTypeFilter : true
                        return matchesSearch && matchesBloodType
                      })
                      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                      .map((unit) => {
                        const diffDays = getDaysLeft(unit.expiryDate)

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
                                {formatDate(unit.collectionDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(unit.expiryDate)}
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

