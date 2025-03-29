"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Activity,
  Droplet,
  User,
  HeartPulse,
  FlaskRoundIcon as Flask,
  Award,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  // Common stats
  totalDonations?: number
  recentDonations?: number
  // Donor stats
  nextEligibleDate?: string
  totalDonated?: number
  // Medical Officer stats
  pendingRequests?: number
  scheduledTransfusions?: number
  // Admin stats
  totalDonors?: number
  totalPatients?: number
  lowInventory?: {
    bloodType: string
    units: number
  }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const userRole = session?.user?.role || ""

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchDashboardStats()
    }
  }, [session, toast])

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Check if donor is eligible
  const isEligible = () => {
    if (!stats.nextEligibleDate) return true
    return new Date(stats.nextEligibleDate) <= new Date()
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-5 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-16 bg-muted rounded"></div>
                <div className="mt-1 h-4 w-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-40 bg-muted rounded"></div>
                <div className="h-4 w-64 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}</p>
      </div>

      {/* Stats Section - Adapts based on user role */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Common Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations || 0}</div>
            <p className="text-xs text-muted-foreground">Completed donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentDonations || 0}</div>
            <p className="text-xs text-muted-foreground">Donations this month</p>
          </CardContent>
        </Card>

        {/* Role-Specific Stats */}
        {userRole === "DONOR" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Eligible Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.nextEligibleDate ? formatDate(stats.nextEligibleDate) : "Eligible now"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isEligible() ? "You can donate now" : "When you can donate again"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                <Droplet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDonated || 0} ml</div>
                <p className="text-xs text-muted-foreground">Blood donated</p>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === "MEDICAL_OFFICER" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Transfusions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduledTransfusions || 0}</div>
                <p className="text-xs text-muted-foreground">Upcoming transfusions</p>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDonors || 0}</div>
                <p className="text-xs text-muted-foreground">Registered donors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground">Registered patients</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Role-Specific Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userRole === "DONOR" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Donation</CardTitle>
                <CardDescription>Book your next blood donation appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>
                    Your last donation was{" "}
                    {stats.nextEligibleDate
                      ? `on ${formatDate(new Date(stats.nextEligibleDate).toISOString())}`
                      : "not recorded"}
                    .
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/schedule">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>View your blood donation records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>You have completed {stats.totalDonations || 0} donations.</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/donation-history">
                      <FileText className="mr-2 h-4 w-4" />
                      View History
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Certificates and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>You have earned {Math.floor((stats.totalDonations || 0) / 5)} donation badges.</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/certificates">
                      <Award className="mr-2 h-4 w-4" />
                      View Certificates
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === "MEDICAL_OFFICER" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Blood Requests</CardTitle>
                <CardDescription>Manage blood transfusion requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>There are {stats.pendingRequests || 0} pending blood requests.</p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/requests">
                      <FileText className="mr-2 h-4 w-4" />
                      View Requests
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Transfusions</CardTitle>
                <CardDescription>Upcoming blood transfusions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>There are {stats.scheduledTransfusions || 0} transfusions scheduled.</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/transfusions">
                      <Droplet className="mr-2 h-4 w-4" />
                      View Transfusions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Donor Screening</CardTitle>
                <CardDescription>Assess donor eligibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>Perform health screening for new and returning donors.</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/donor-screening">
                      <HeartPulse className="mr-2 h-4 w-4" />
                      Donor Screening
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Blood Inventory</CardTitle>
                <CardDescription>Current blood stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.lowInventory && stats.lowInventory.length > 0 ? (
                    <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/50">
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Low Stock Alert</h4>
                      <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        {stats.lowInventory.map((item, idx) => (
                          <li key={idx}>
                            {formatBloodType(item.bloodType)}: {item.units} units
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>All blood types are well-stocked.</p>
                  )}
                  <Button asChild>
                    <Link href="/dashboard/inventory">
                      <Flask className="mr-2 h-4 w-4" />
                      View Inventory
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest blood donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>There have been {stats.recentDonations || 0} donations this month.</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/donations">
                      <Droplet className="mr-2 h-4 w-4" />
                      View Donations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Database health and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>
                    {stats.totalDonors || 0} donors, {stats.totalPatients || 0} patients, {stats.totalDonations || 0}{" "}
                    donations
                  </p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/reports">
                      <Activity className="mr-2 h-4 w-4" />
                      View Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

