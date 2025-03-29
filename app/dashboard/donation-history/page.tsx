"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Droplet, FileText, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DonationStats {
  totalDonations: number
  totalVolume: number
  lastDonation: string | null
  nextEligibleDate: string | null
}

interface Donation {
  id: string
  scheduledDate: string
  actualDate: string | null
  status: string
  hemoglobinLevel: number | null
  bloodUnits: Array<{ id: string; volume: number }>
  notes: string | null
}

export default function DonationHistoryPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalVolume: 0,
    lastDonation: null,
    nextEligibleDate: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        setIsLoading(true)

        // Fetch donation stats
        const statsResponse = await fetch("/api/donations/stats")
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch donation stats")
        }
        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch donation history
        const historyResponse = await fetch("/api/donations")
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch donation history")
        }
        const historyData = await historyResponse.json()
        setDonations(historyData)
      } catch (error) {
        console.error("Error fetching donation data:", error)
        toast({
          title: "Error",
          description: "Failed to load donation history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonationHistory()
  }, [toast])

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success"
      case "SCHEDULED":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      case "DEFERRED":
        return "warning"
      default:
        return "outline"
    }
  }

  // Helper function to check if donor is eligible
  const isEligible = () => {
    if (!stats.nextEligibleDate) return true
    return new Date(stats.nextEligibleDate) <= new Date()
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation History</h1>
          <p className="text-muted-foreground">View your blood donation history and statistics</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Donation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <p className="text-xs text-muted-foreground">Completed donations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolume} ml</div>
            <p className="text-xs text-muted-foreground">Blood donated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastDonation ? formatDate(stats.lastDonation) : "Never"}</div>
            <p className="text-xs text-muted-foreground">Date of last donation</p>
          </CardContent>
        </Card>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Donation History</CardTitle>
          <CardDescription>A record of all your blood donations</CardDescription>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hemoglobin</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No donation history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{formatDate(donation.scheduledDate)}</div>
                            {donation.status === "SCHEDULED" && (
                              <div className="text-xs text-muted-foreground">Scheduled</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(donation.status)}>{donation.status}</Badge>
                      </TableCell>
                      <TableCell>{donation.hemoglobinLevel ? `${donation.hemoglobinLevel} g/dL` : "-"}</TableCell>
                      <TableCell>
                        {donation.bloodUnits.length > 0
                          ? `${donation.bloodUnits.reduce((sum, unit) => sum + unit.volume, 0)} ml`
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{donation.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/donation-history/${donation.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Details
                          </Link>
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

      <Card>
        <CardHeader>
          <CardTitle>Your Impact</CardTitle>
          <CardDescription>See how your donations have helped save lives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{stats.totalDonations * 3}</div>
            <p className="text-sm text-muted-foreground">Lives potentially saved</p>
            <p className="mt-2 text-sm">Each donation can save up to 3 lives</p>
          </div>

          <div className="mt-6 rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-medium">Did you know?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary">•</span>
                <span>Every 2 seconds someone needs blood</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary">•</span>
                <span>A single car accident victim can require as many as 100 units of blood</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary">•</span>
                <span>Blood cannot be manufactured – it can only come from generous donors</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary">•</span>
                <span>The average adult has about 10 pints of blood in their body</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/schedule">
                Schedule Your Next Donation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

