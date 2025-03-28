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
import { Search, Plus, Download, Calendar, User, Droplet, CheckCircle2, XCircle } from "lucide-react"

export default function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("")
  const [eligibilityFilter, setEligibilityFilter] = useState("")

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // This is just mock data for demonstration
    const mockDonors = [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        bloodType: "A_POSITIVE",
        gender: "Male",
        phoneNumber: "+255 123 456 789",
        lastDonation: "2023-03-15",
        eligibleToDonateSince: "2023-05-10",
        totalDonations: 5,
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        bloodType: "O_NEGATIVE",
        gender: "Female",
        phoneNumber: "+255 987 654 321",
        lastDonation: "2023-04-20",
        eligibleToDonateSince: "2023-06-15",
        totalDonations: 3,
      },
      {
        id: "3",
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        bloodType: "B_POSITIVE",
        gender: "Male",
        phoneNumber: "+255 456 789 123",
        lastDonation: "2023-01-10",
        eligibleToDonateSince: "2023-03-07",
        totalDonations: 8,
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        bloodType: "AB_POSITIVE",
        gender: "Female",
        phoneNumber: "+255 789 123 456",
        lastDonation: null,
        eligibleToDonateSince: null,
        totalDonations: 0,
      },
      {
        id: "5",
        name: "Michael Brown",
        email: "michael.brown@example.com",
        bloodType: "A_NEGATIVE",
        gender: "Male",
        phoneNumber: "+255 321 654 987",
        lastDonation: "2023-05-05",
        eligibleToDonateSince: "2023-07-01",
        totalDonations: 2,
      },
    ]

    // Simulate API call
    setTimeout(() => {
      setDonors(mockDonors)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper function to format blood type for display
  const formatBloodType = (type) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Helper function to check if donor is eligible
  const isEligible = (donor) => {
    if (!donor.eligibleToDonateSince) return true
    return new Date(donor.eligibleToDonateSince) <= new Date()
  }

  // Filter donors based on search query and filters
  const filteredDonors = donors.filter((donor) => {
    // Search query filter
    const matchesSearch =
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.phoneNumber.includes(searchQuery)

    // Blood type filter
    const matchesBloodType = bloodTypeFilter ? donor.bloodType === bloodTypeFilter : true

    // Eligibility filter
    let matchesEligibility = true
    if (eligibilityFilter === "eligible") {
      matchesEligibility = isEligible(donor)
    } else if (eligibilityFilter === "ineligible") {
      matchesEligibility = !isEligible(donor)
    }

    return matchesSearch && matchesBloodType && matchesEligibility
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donors</h1>
          <p className="text-muted-foreground">Manage blood donors and their information</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/donors/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Donor
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
            <TabsTrigger value="all">All Donors</TabsTrigger>
            <TabsTrigger value="eligible">Eligible</TabsTrigger>
            <TabsTrigger value="recent">Recent Donors</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search donors..."
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
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No donors found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDonors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{donor.name}</div>
                                <div className="text-xs text-muted-foreground">{donor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(donor.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{donor.gender}</TableCell>
                          <TableCell>{donor.phoneNumber}</TableCell>
                          <TableCell>
                            {donor.lastDonation ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(donor.lastDonation).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never donated</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEligible(donor) ? (
                              <div className="flex items-center">
                                <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-500">Eligible</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <XCircle className="mr-1 h-4 w-4 text-amber-500" />
                                <span className="text-sm text-amber-500">
                                  Eligible {new Date(donor.eligibleToDonateSince).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/donors/${donor.id}`}>View</Link>
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

        <TabsContent value="eligible" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligible Donors</CardTitle>
              <CardDescription>Donors who are currently eligible to donate blood</CardDescription>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead>Total Donations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors
                      .filter((donor) => isEligible(donor))
                      .map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{donor.name}</div>
                                <div className="text-xs text-muted-foreground">{donor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(donor.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {donor.lastDonation ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(donor.lastDonation).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never donated</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Droplet className="h-4 w-4 text-muted-foreground" />
                              {donor.totalDonations} donations
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/donations/schedule?donorId=${donor.id}`}>Schedule Donation</Link>
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

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donors</CardTitle>
              <CardDescription>Donors who have donated in the last 3 months</CardDescription>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead>Next Eligible Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors
                      .filter(
                        (donor) =>
                          donor.lastDonation &&
                          new Date(donor.lastDonation) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                      )
                      .map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{donor.name}</div>
                                <div className="text-xs text-muted-foreground">{donor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium text-primary">
                              {formatBloodType(donor.bloodType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(donor.lastDonation).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {donor.eligibleToDonateSince && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(donor.eligibleToDonateSince).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/donors/${donor.id}`}>View</Link>
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
      </Tabs>
    </div>
  )
}

