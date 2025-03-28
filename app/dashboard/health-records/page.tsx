"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Activity, Droplet, HeartPulse, Download, Printer } from "lucide-react"

export default function HealthRecordsPage() {
  const [activeTab, setActiveTab] = useState("donations")

  // Mock data for donation history
  const donations = [
    {
      id: "D1001",
      date: "2023-03-15T09:30:00Z",
      status: "COMPLETED",
      hemoglobinLevel: 14.2,
      bloodPressure: "120/80",
      pulse: 72,
      notes: "Successful donation, no complications",
    },
    {
      id: "D1002",
      date: "2022-12-10T11:15:00Z",
      status: "COMPLETED",
      hemoglobinLevel: 13.8,
      bloodPressure: "118/78",
      pulse: 68,
      notes: "Donor was slightly dehydrated but donation was successful",
    },
    {
      id: "D1003",
      date: "2022-09-05T10:00:00Z",
      status: "COMPLETED",
      hemoglobinLevel: 14.5,
      bloodPressure: "122/82",
      pulse: 70,
      notes: "Excellent donation, donor was well prepared",
    },
    {
      id: "D1004",
      date: "2022-06-20T14:30:00Z",
      status: "COMPLETED",
      hemoglobinLevel: 13.9,
      bloodPressure: "124/84",
      pulse: 74,
      notes: "Normal donation, no issues",
    },
    {
      id: "D1005",
      date: "2022-03-15T13:00:00Z",
      status: "COMPLETED",
      hemoglobinLevel: 14.0,
      bloodPressure: "120/78",
      pulse: 72,
      notes: "Donor experienced mild dizziness after donation but recovered quickly",
    },
  ]

  // Mock data for health screenings
  const screenings = [
    {
      id: "DS-001-23",
      date: "2023-06-10T08:30:00Z",
      status: "ELIGIBLE",
      vitals: {
        temperature: "36.7°C",
        pulse: "72 bpm",
        bloodPressure: "120/80 mmHg",
        weight: "75 kg",
        hemoglobin: "14.2 g/dL",
      },
      doctorName: "Dr. James Mwakasege",
      notes: "Donor is in good health, eligible to donate",
    },
    {
      id: "DS-002-22",
      date: "2022-12-05T10:15:00Z",
      status: "ELIGIBLE",
      vitals: {
        temperature: "36.5°C",
        pulse: "68 bpm",
        bloodPressure: "118/78 mmHg",
        weight: "74 kg",
        hemoglobin: "13.8 g/dL",
      },
      doctorName: "Dr. Emily Davis",
      notes: "Donor is in good health, eligible to donate",
    },
    {
      id: "DS-003-22",
      date: "2022-09-01T09:00:00Z",
      status: "ELIGIBLE",
      vitals: {
        temperature: "36.6°C",
        pulse: "70 bpm",
        bloodPressure: "122/82 mmHg",
        weight: "75 kg",
        hemoglobin: "14.5 g/dL",
      },
      doctorName: "Dr. James Mwakasege",
      notes: "Donor is in good health, eligible to donate",
    },
    {
      id: "DS-004-22",
      date: "2022-03-10T11:30:00Z",
      status: "DEFERRED",
      vitals: {
        temperature: "37.2°C",
        pulse: "82 bpm",
        bloodPressure: "130/85 mmHg",
        weight: "73 kg",
        hemoglobin: "11.8 g/dL",
      },
      doctorName: "Dr. James Mwakasege",
      deferralReason: "Low hemoglobin level",
      deferralPeriod: "3 months",
      notes: "Donor advised to take iron supplements and return after 3 months",
    },
  ]

  // Mock data for test results
  const testResults = [
    {
      id: "TR-001-23",
      date: "2023-06-10T08:30:00Z",
      type: "BLOOD_SCREENING",
      results: {
        hiv: "NEGATIVE",
        hepatitisB: "NEGATIVE",
        hepatitisC: "NEGATIVE",
        syphilis: "NEGATIVE",
        bloodGroup: "A_POSITIVE",
      },
      technicianName: "Michael Brown",
      notes: "All tests normal",
    },
    {
      id: "TR-002-22",
      date: "2022-12-05T10:15:00Z",
      type: "BLOOD_SCREENING",
      results: {
        hiv: "NEGATIVE",
        hepatitisB: "NEGATIVE",
        hepatitisC: "NEGATIVE",
        syphilis: "NEGATIVE",
        bloodGroup: "A_POSITIVE",
      },
      technicianName: "Michael Brown",
      notes: "All tests normal",
    },
    {
      id: "TR-003-22",
      date: "2022-09-01T09:00:00Z",
      type: "BLOOD_SCREENING",
      results: {
        hiv: "NEGATIVE",
        hepatitisB: "NEGATIVE",
        hepatitisC: "NEGATIVE",
        syphilis: "NEGATIVE",
        bloodGroup: "A_POSITIVE",
      },
      technicianName: "Michael Brown",
      notes: "All tests normal",
    },
    {
      id: "TR-004-22",
      date: "2022-03-10T11:30:00Z",
      type: "BLOOD_SCREENING",
      results: {
        hiv: "NEGATIVE",
        hepatitisB: "NEGATIVE",
        hepatitisC: "NEGATIVE",
        syphilis: "NEGATIVE",
        bloodGroup: "A_POSITIVE",
      },
      technicianName: "Michael Brown",
      notes: "All tests normal",
    },
  ]

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "ELIGIBLE":
        return "success"
      case "DEFERRED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get badge variant based on test result
  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "NEGATIVE":
        return "success"
      case "POSITIVE":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
          <p className="text-muted-foreground">View your health and donation records</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Summary</CardTitle>
          <CardDescription>Overview of your health and donation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Donation History</h3>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-bold">{donations.length}</div>
                <p className="text-sm text-muted-foreground">Total donations</p>
              </div>
              <div className="mt-2 text-sm">
                <div>
                  Last donation: {donations.length > 0 ? new Date(donations[0].date).toLocaleDateString() : "None"}
                </div>
                <div>Total volume: {donations.length * 450} ml</div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Vital Signs</h3>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {screenings.length > 0 ? (
                  <>
                    <div>Hemoglobin: {screenings[0].vitals.hemoglobin}</div>
                    <div>Blood Pressure: {screenings[0].vitals.bloodPressure}</div>
                    <div>Pulse: {screenings[0].vitals.pulse}</div>
                    <div>Weight: {screenings[0].vitals.weight}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(screenings[0].date).toLocaleDateString()}
                    </div>
                  </>
                ) : (
                  <div>No recent vital signs recorded</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Eligibility Status</h3>
              </div>
              <div className="mt-2">
                {screenings.length > 0 ? (
                  <Badge variant={getStatusBadgeVariant(screenings[0].status)}>{screenings[0].status}</Badge>
                ) : (
                  <Badge variant="outline">UNKNOWN</Badge>
                )}
              </div>
              <div className="mt-2 text-sm">
                {screenings.length > 0 && screenings[0].status === "DEFERRED" ? (
                  <>
                    <div>Reason: {screenings[0].deferralReason}</div>
                    <div>Period: {screenings[0].deferralPeriod}</div>
                  </>
                ) : (
                  <div>You are eligible to donate blood</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="donations">Donation History</TabsTrigger>
          <TabsTrigger value="screenings">Health Screenings</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>Record of your blood donations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donation ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hemoglobin</TableHead>
                    <TableHead>Blood Pressure</TableHead>
                    <TableHead>Pulse</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No donation history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(donation.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(donation.status)}>{donation.status}</Badge>
                        </TableCell>
                        <TableCell>{donation.hemoglobinLevel} g/dL</TableCell>
                        <TableCell>{donation.bloodPressure}</TableCell>
                        <TableCell>{donation.pulse} bpm</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Screenings</CardTitle>
              <CardDescription>Record of your health screenings and eligibility assessments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Screening ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hemoglobin</TableHead>
                    <TableHead>Blood Pressure</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No screening history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    screenings.map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell className="font-medium">{screening.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(screening.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(screening.status)}>{screening.status}</Badge>
                        </TableCell>
                        <TableCell>{screening.vitals.hemoglobin}</TableCell>
                        <TableCell>{screening.vitals.bloodPressure}</TableCell>
                        <TableCell>{screening.doctorName}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/health-records/screenings/${screening.id}`}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Record of your blood test results</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No test results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    testResults.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(test.date)}
                          </div>
                        </TableCell>
                        <TableCell>{test.type.replace(/_/g, " ")}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Badge variant={getResultBadgeVariant(test.results.hiv)} className="text-xs">
                                HIV: {test.results.hiv}
                              </Badge>
                              <Badge variant={getResultBadgeVariant(test.results.hepatitisB)} className="text-xs">
                                HBV: {test.results.hepatitisB}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={getResultBadgeVariant(test.results.hepatitisC)} className="text-xs">
                                HCV: {test.results.hepatitisC}
                              </Badge>
                              <Badge variant={getResultBadgeVariant(test.results.syphilis)} className="text-xs">
                                SYP: {test.results.syphilis}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{test.technicianName}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/health-records/tests/${test.id}`}>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

