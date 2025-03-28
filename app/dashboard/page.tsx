"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Calendar,
  Droplet,
  Users,
  Activity,
  AlertTriangle,
  ArrowRight,
  FlaskRoundIcon as Flask,
  HeartPulse,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    totalPatients: 0,
    totalBloodUnits: 0,
    pendingRequests: 0,
    lowInventory: [],
    upcomingDonations: [],
    expiringUnits: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // This is just mock data for demonstration
    const mockData = {
      totalDonors: 248,
      totalDonations: 156,
      totalPatients: 312,
      totalBloodUnits: 423,
      pendingRequests: 8,
      lowInventory: [
        { type: "O_NEGATIVE", count: 5 },
        { type: "AB_NEGATIVE", count: 3 },
      ],
      upcomingDonations: [
        { id: "1", donorName: "John Doe", date: "2023-06-15" },
        { id: "2", donorName: "Jane Smith", date: "2023-06-16" },
        { id: "3", donorName: "Robert Johnson", date: "2023-06-17" },
      ],
      expiringUnits: 12,
    }

    // Simulate API call
    setTimeout(() => {
      setStats(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper function to format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Render different dashboard based on user role
  const renderDashboard = () => {
    const role = session?.user?.role

    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )
    }

    switch (role) {
      case "ADMIN":
        return renderAdminDashboard()
      case "DONOR":
        return renderDonorDashboard()
      case "MEDICAL_OFFICER":
        return renderMedicalOfficerDashboard()
      case "BLOOD_BANK_TECHNICIAN":
        return renderTechnicianDashboard()
      default:
        return renderDefaultDashboard()
    }
  }

  // Admin Dashboard
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
              <p className="text-xs text-muted-foreground">Registered blood donors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Units</CardTitle>
              <Flask className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBloodUnits}</div>
              <p className="text-xs text-muted-foreground">Available blood units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground">Completed this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Registered patients</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Blood Inventory Status</CardTitle>
              <CardDescription>Current blood units by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {/* In a real app, you would use a chart library here */}
                <div className="flex h-full items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Blood inventory chart</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.lowInventory.length > 0 && (
                  <div className="flex items-center space-x-2 rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Low Blood Inventory</p>
                      <div className="text-xs text-muted-foreground">
                        {stats.lowInventory.map((item) => (
                          <div key={item.type}>
                            {formatBloodType(item.type)}: {item.count} units
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {stats.expiringUnits > 0 && (
                  <div className="flex items-center space-x-2 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Expiring Blood Units</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.expiringUnits} units expiring in the next 7 days
                      </p>
                    </div>
                  </div>
                )}
                {stats.pendingRequests > 0 && (
                  <div className="flex items-center space-x-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Pending Blood Requests</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.pendingRequests} requests awaiting approval
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Upcoming Donations</CardTitle>
                <CardDescription>Scheduled for the next 7 days</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/donations">
                  <span className="mr-1">View all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.upcomingDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{donation.donorName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(donation.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/donations/${donation.id}`}>Details</Link>
                    </Button>
                  </div>
                ))}
                {stats.upcomingDonations.length === 0 && (
                  <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                    No upcoming donations scheduled
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/activity">
                  <span className="mr-1">View all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 rounded-md border p-3">
                  <Droplet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">New donation completed</p>
                    <p className="text-xs text-muted-foreground">John Doe donated blood - 10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rounded-md border p-3">
                  <Flask className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Blood units added</p>
                    <p className="text-xs text-muted-foreground">5 new units added to inventory - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rounded-md border p-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Blood request approved</p>
                    <p className="text-xs text-muted-foreground">Request for Patient #12345 - 3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Donor Dashboard
  const renderDonorDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Donations</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Total donations made</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 months ago</div>
              <p className="text-xs text-muted-foreground">March 15, 2023</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Eligible Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Eligible now</div>
              <p className="text-xs text-muted-foreground">You can schedule a donation</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
            <CardDescription>See how your donations have helped</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">15</div>
                <p className="text-sm text-muted-foreground">Lives potentially saved</p>
              </div>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">2,250</div>
                  <p className="text-sm text-muted-foreground">ml of blood donated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-sm text-muted-foreground">donation visits</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Donation</CardTitle>
              <CardDescription>Book your next blood donation appointment</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" className="mt-2" asChild>
                <Link href="/dashboard/schedule">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Now
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Blood Donation Tips</CardTitle>
              <CardDescription>Prepare for your next donation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-primary">•</span>
                  <span>Stay hydrated by drinking plenty of water before donation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-primary">•</span>
                  <span>Eat a healthy meal within 3 hours of your donation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-primary">•</span>
                  <span>Avoid fatty foods before donating</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-primary">•</span>
                  <span>Get a good night's sleep before your donation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Medical Officer Dashboard
  const renderMedicalOfficerDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transfusions</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Blood</CardTitle>
              <Flask className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBloodUnits}</div>
              <p className="text-xs text-muted-foreground">Units in inventory</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="patients">Recent Patients</TabsTrigger>
            <TabsTrigger value="transfusions">Recent Transfusions</TabsTrigger>
          </TabsList>
          <TabsContent value="requests" className="space-y-4 pt-4">
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b p-4">
                <div className="font-medium">Recent Blood Requests</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/requests">View All</Link>
                </Button>
              </div>
              <div className="divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Emergency Request</div>
                    <div className="text-sm text-muted-foreground">Patient: John Doe • O+ • 2 units</div>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Urgent Request</div>
                    <div className="text-sm text-muted-foreground">Patient: Jane Smith • AB- • 1 unit</div>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Standard Request</div>
                    <div className="text-sm text-muted-foreground">Patient: Robert Johnson • A+ • 3 units</div>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="patients" className="pt-4">
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b p-4">
                <div className="font-medium">Recently Added Patients</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/patients">View All</Link>
                </Button>
              </div>
              <div className="divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Sarah Williams</div>
                    <div className="text-sm text-muted-foreground">ID: P12345 • Female • 35 years • B+</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/patients/1">View</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Michael Brown</div>
                    <div className="text-sm text-muted-foreground">ID: P12346 • Male • 42 years • O-</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/patients/2">View</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Emily Davis</div>
                    <div className="text-sm text-muted-foreground">ID: P12347 • Female • 28 years • A+</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/patients/3">View</Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="transfusions" className="pt-4">
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b p-4">
                <div className="font-medium">Recent Transfusions</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/transfusions">View All</Link>
                </Button>
              </div>
              <div className="divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Transfusion #T1001</div>
                    <div className="text-sm text-muted-foreground">Patient: John Doe • 2 units • June 10, 2023</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/transfusions/1">Details</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Transfusion #T1002</div>
                    <div className="text-sm text-muted-foreground">Patient: Jane Smith • 1 unit • June 9, 2023</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/transfusions/2">Details</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Transfusion #T1003</div>
                    <div className="text-sm text-muted-foreground">
                      Patient: Robert Johnson • 3 units • June 8, 2023
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/transfusions/3">Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Blood Bank Technician Dashboard
  const renderTechnicianDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Inventory</CardTitle>
              <Flask className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBloodUnits}</div>
              <p className="text-xs text-muted-foreground">Total available units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations Today</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringUnits}</div>
              <p className="text-xs text-muted-foreground">Units expiring in 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Blood Inventory Status</CardTitle>
              <CardDescription>Current blood units by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">A+</div>
                    <div className="text-sm">85 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">A-</div>
                    <div className="text-sm">32 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">B+</div>
                    <div className="text-sm">76 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">B-</div>
                    <div className="text-sm">28 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">AB+</div>
                    <div className="text-sm">42 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">AB-</div>
                    <div className="text-sm">15 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">O+</div>
                    <div className="text-sm">95 units</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-500">O-</div>
                    <div className="text-sm">50 units</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/inventory">View Detailed Inventory</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Today's Donations</CardTitle>
              <CardDescription>Scheduled donations for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="divide-y rounded-md border">
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-muted-foreground">9:00 AM • O+ • First time donor</div>
                    </div>
                    <Button size="sm">Process</Button>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-xs text-muted-foreground">10:30 AM • A- • Regular donor</div>
                    </div>
                    <Button size="sm">Process</Button>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">Robert Johnson</div>
                      <div className="text-xs text-muted-foreground">1:00 PM • B+ • Regular donor</div>
                    </div>
                    <Button size="sm">Process</Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/donations">View All Donations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowInventory.length > 0 && (
                <div className="flex items-center space-x-2 rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Low Blood Inventory</p>
                    <div className="text-xs text-muted-foreground">
                      {stats.lowInventory.map((item) => (
                        <div key={item.type}>
                          {formatBloodType(item.type)}: {item.count} units
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/inventory">Manage</Link>
                  </Button>
                </div>
              )}
              {stats.expiringUnits > 0 && (
                <div className="flex items-center space-x-2 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Expiring Blood Units</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.expiringUnits} units expiring in the next 7 days
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/inventory?filter=expiring">Review</Link>
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                <Activity className="h-5 w-5 text-blue-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Blood Request Approvals</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingRequests} requests awaiting processing</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/dashboard/requests?status=PENDING">Process</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default Dashboard (fallback)
  const renderDefaultDashboard = () => {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
        <HeartPulse className="h-16 w-16 text-primary" />
        <h2 className="text-2xl font-bold">Welcome to Nyamagana Blood Bank</h2>
        <p className="text-center text-muted-foreground">
          Please contact an administrator if you cannot access your dashboard.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {renderDashboard()}
    </div>
  )
}

