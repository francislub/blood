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
import { useToast } from "@/hooks/use-toast"

interface Screening {
  id: string
  donorId: string
  donorName: string
  bloodType: string
  status: string
  date?: string
  scheduledDate?: string
  vitals?: {
    temperature: string
    pulse: string
    bloodPressure: string
    weight: string
    hemoglobin: string
  }
  doctorName?: string
  deferralReason?: string
  deferralPeriod?: string
  notes?: string
}

interface Donor {
  id: string
  user: {
    name: string
  }
  bloodType: string
}

export default function DonorScreeningPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddScreeningOpen, setIsAddScreeningOpen] = useState(false)
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDonor, setSelectedDonor] = useState("")
  const [screeningForm, setScreeningForm] = useState({
    temperature: "36.7",
    pulse: "72",
    bloodPressure: "120/80",
    weight: "70",
    hemoglobin: "14.0",
    questionnaire: "yes",
    status: "ELIGIBLE",
    deferralReason: "",
    deferralPeriod: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch screenings
        const screeningsResponse = await fetch("/api/donor-screenings")
        if (!screeningsResponse.ok) {
          throw new Error("Failed to fetch screenings")
        }
        const screeningsData = await screeningsResponse.json()
        setScreenings(screeningsData)

        // Fetch eligible donors for screening
        const donorsResponse = await fetch("/api/donors?eligible=true")
        if (!donorsResponse.ok) {
          throw new Error("Failed to fetch donors")
        }
        const donorsData = await donorsResponse.json()
        setDonors(donorsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load screening data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setScreeningForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setScreeningForm((prev) => ({ ...prev, [name]: value }))

    // Toggle deferral fields based on eligibility status
    if (name === "status") {
      const isDeferred = value === "DEFERRED"
      if (!isDeferred) {
        setScreeningForm((prev) => ({ ...prev, deferralReason: "", deferralPeriod: "" }))
      }
    }
  }

  const handleSubmitScreening = async () => {
    try {
      if (!selectedDonor) {
        toast({
          title: "Error",
          description: "Please select a donor",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/donor-screenings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorId: selectedDonor,
          vitals: {
            temperature: `${screeningForm.temperature}°C`,
            pulse: `${screeningForm.pulse} bpm`,
            bloodPressure: `${screeningForm.bloodPressure} mmHg`,
            weight: `${screeningForm.weight} kg`,
            hemoglobin: `${screeningForm.hemoglobin} g/dL`,
          },
          questionnaireCompleted: screeningForm.questionnaire === "yes",
          status: screeningForm.status,
          deferralReason: screeningForm.status === "DEFERRED" ? screeningForm.deferralReason : null,
          deferralPeriod: screeningForm.status === "DEFERRED" ? screeningForm.deferralPeriod : null,
          notes: screeningForm.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to record screening")
      }

      toast({
        title: "Success",
        description: "Donor screening has been recorded",
      })

      // Reset form and close dialog
      setSelectedDonor("")
      setScreeningForm({
        temperature: "36.7",
        pulse: "72",
        bloodPressure: "120/80",
        weight: "70",
        hemoglobin: "14.0",
        questionnaire: "yes",
        status: "ELIGIBLE",
        deferralReason: "",
        deferralPeriod: "",
        notes: "",
      })
      setIsAddScreeningOpen(false)

      // Refresh data
      const response2 = await fetch("/api/donor-screenings")
      const data = await response2.json()
      setScreenings(data)
    } catch (error) {
      console.error("Error recording screening:", error)
      toast({
        title: "Error",
        description: "Failed to record donor screening",
        variant: "destructive",
      })
    }
  }

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
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
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
                  <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donor" />
                    </SelectTrigger>
                    <SelectContent>
                      {donors.map((donor) => (
                        <SelectItem key={donor.id} value={donor.id}>
                          {donor.user.name} ({formatBloodType(donor.bloodType)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium">Vital Signs</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={screeningForm.temperature}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pulse">Pulse (bpm)</Label>
                      <Input id="pulse" type="number" value={screeningForm.pulse} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                      <Input
                        id="bloodPressure"
                        placeholder="120/80"
                        value={screeningForm.bloodPressure}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={screeningForm.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      value={screeningForm.hemoglobin}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="questionnaire">Questionnaire Completed</Label>
                  <Select
                    value={screeningForm.questionnaire}
                    onValueChange={(value) => handleSelectChange("questionnaire", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={screeningForm.questionnaire === "yes" ? "Yes" : "No"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Eligibility Status</Label>
                  <Select value={screeningForm.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
                  <Label htmlFor="deferralReason">Deferral Reason (if applicable)</Label>
                  <Input
                    id="deferralReason"
                    placeholder="Reason for deferral"
                    disabled={screeningForm.status !== "DEFERRED"}
                    value={screeningForm.deferralReason}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deferralPeriod">Deferral Period (if applicable)</Label>
                  <Select
                    disabled={screeningForm.status !== "DEFERRED"}
                    value={screeningForm.deferralPeriod}
                    onValueChange={(value) => handleSelectChange("deferralPeriod", value)}
                  >
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
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the screening..."
                    value={screeningForm.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddScreeningOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitScreening}>Save Results</Button>
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
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DEFERRED">Deferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
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
                                  <Link href={`/dashboard/donor-screening/${screening.id}/record`}>
                                    Record Screening
                                  </Link>
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
                                <span className="font-medium">Scheduled Date:</span>{" "}
                                {formatDate(screening.scheduledDate)}
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
                                <div>Hb: {screening.vitals?.hemoglobin}</div>
                                <div>BP: {screening.vitals?.bloodPressure}</div>
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
          </>
        )}
      </Tabs>
    </div>
  )
}

