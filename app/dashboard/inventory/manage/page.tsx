"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { AlertCircle, Check, Plus, Search, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ManageInventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bloodUnits, setBloodUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBloodType, setFilterBloodType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (status === "authenticated" && !["ADMIN", "BLOOD_BANK_TECHNICIAN"].includes(session?.user?.role as string)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchBloodUnits()
    }
  }, [session, status, router])

  const fetchBloodUnits = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/blood-units")
      if (!response.ok) {
        throw new Error("Failed to fetch blood units")
      }
      const data = await response.json()
      setBloodUnits(data)
    } catch (error) {
      console.error("Error fetching blood units:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (unitId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/blood-units/${unitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update blood unit status")
      }

      toast({
        title: "Status Updated",
        description: `Blood unit status has been updated to ${newStatus.toLowerCase()}.`,
      })

      // Update the local state
      setBloodUnits((prevUnits) =>
        prevUnits.map((unit) => (unit.id === unitId ? { ...unit, status: newStatus } : unit)),
      )
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update blood unit status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredUnits = bloodUnits.filter((unit) => {
    const matchesSearch =
      unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.donationId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBloodType = filterBloodType === "all" || unit.bloodType === filterBloodType
    const matchesStatus = filterStatus === "all" || unit.status === filterStatus

    return matchesSearch && matchesBloodType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500">Available</Badge>
      case "RESERVED":
        return <Badge className="bg-blue-500">Reserved</Badge>
      case "QUARANTINED":
        return <Badge className="bg-yellow-500">Quarantined</Badge>
      case "DISCARDED":
        return <Badge className="bg-red-500">Discarded</Badge>
      case "USED":
        return <Badge className="bg-gray-500">Used</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysLeft = differenceInDays(expiry, today)

    if (daysLeft < 0) {
      return <span className="text-red-500">Expired</span>
    } else if (daysLeft <= 7) {
      return <span className="text-orange-500">{daysLeft} days</span>
    } else {
      return <span>{daysLeft} days</span>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (status === "authenticated" && ["ADMIN", "BLOOD_BANK_TECHNICIAN"].includes(session?.user?.role as string)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Blood Inventory</h1>
          <Button onClick={() => router.push("/dashboard/inventory/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Blood Unit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blood Units Inventory</CardTitle>
            <CardDescription>View and manage all blood units in the blood bank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by unit number or donation ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Blood Type" />
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                    <SelectItem value="DISCARDED">Discarded</SelectItem>
                    <SelectItem value="USED">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Collection Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No blood units found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                        <TableCell>
                          {unit.bloodType.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")}
                        </TableCell>
                        <TableCell>{format(new Date(unit.collectionDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(unit.expiryDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getDaysUntilExpiry(unit.expiryDate)}</TableCell>
                        <TableCell>{getStatusBadge(unit.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {unit.status !== "AVAILABLE" && unit.status !== "DISCARDED" && unit.status !== "USED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStatusChange(unit.id, "AVAILABLE")}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="sr-only">Mark as Available</span>
                              </Button>
                            )}
                            {unit.status !== "QUARANTINED" && unit.status !== "DISCARDED" && unit.status !== "USED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStatusChange(unit.id, "QUARANTINED")}
                              >
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                <span className="sr-only">Quarantine</span>
                              </Button>
                            )}
                            {unit.status !== "DISCARDED" && unit.status !== "USED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStatusChange(unit.id, "DISCARDED")}
                              >
                                <X className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Discard</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUnits.length} of {bloodUnits.length} blood units
            </div>
            <Button variant="outline" onClick={fetchBloodUnits}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return null
}

