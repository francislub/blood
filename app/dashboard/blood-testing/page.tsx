"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { AlertCircle, CheckCircle2, Search, Droplet, AlertTriangle, XCircle } from "lucide-react"

export default function BloodTestingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDonations, setPendingDonations] = useState([])
  const [completedTests, setCompletedTests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [testResults, setTestResults] = useState({
    hiv: false,
    hepatitisB: false,
    hepatitisC: false,
    syphilis: false,
    malaria: false,
    hemoglobin: "",
    notes: "",
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Only technicians and admins can access this page
    if (session.user.role !== "BLOOD_BANK_TECHNICIAN" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchDonations()
  }, [session, status, router])

  const fetchDonations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/donations?status=COLLECTED")
      if (!response.ok) throw new Error("Failed to fetch donations")
      const pendingData = await response.json()
      setPendingDonations(pendingData)

      const completedResponse = await fetch("/api/donations?status=TESTED")
      if (!completedResponse.ok) throw new Error("Failed to fetch completed tests")
      const completedData = await completedResponse.json()
      setCompletedTests(completedData)
    } catch (error) {
      console.error("Error fetching donations:", error)
      toast({
        title: "Error",
        description: "Failed to load donations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDonation = (donation) => {
    setSelectedDonation(donation)
    // Reset test results
    setTestResults({
      hiv: false,
      hepatitisB: false,
      hepatitisC: false,
      syphilis: false,
      malaria: false,
      hemoglobin: "",
      notes: "",
    })
  }

  const handleSubmitTest = async () => {
    if (!selectedDonation) return

    if (!testResults.hemoglobin) {
      toast({
        title: "Error",
        description: "Please enter hemoglobin level",
        variant: "destructive",
      })
      return
    }

    const hemoglobinLevel = Number.parseFloat(testResults.hemoglobin)
    if (isNaN(hemoglobinLevel) || hemoglobinLevel < 8 || hemoglobinLevel > 20) {
      toast({
        title: "Error",
        description: "Please enter a valid hemoglobin level (8-20 g/dL)",
        variant: "destructive",
      })
      return
    }

    // Check if any tests are positive
    const hasInfection =
      testResults.hiv || testResults.hepatitisB || testResults.hepatitisC || testResults.syphilis || testResults.malaria

    try {
      const response = await fetch(`/api/donations/${selectedDonation.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testResults: {
            ...testResults,
            hemoglobin: hemoglobinLevel,
          },
          status: hasInfection ? "REJECTED" : "TESTED",
          rejectionReason: hasInfection ? "Failed infectious disease screening" : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit test results")
      }

      toast({
        title: "Success",
        description: "Test results submitted successfully",
      })

      // Refresh donations
      fetchDonations()
      setSelectedDonation(null)
    } catch (error) {
      console.error("Error submitting test results:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit test results",
        variant: "destructive",
      })
    }
  }

  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  const filteredPendingDonations = pendingDonations.filter(
    (donation) =>
      donation.donor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatBloodType(donation.bloodType).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCompletedTests = completedTests.filter(
    (donation) =>
      donation.donor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatBloodType(donation.bloodType).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blood Testing</h1>
        <p className="text-muted-foreground">Test donated blood for infectious diseases and quality</p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by donor name, donation ID, or blood type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={fetchDonations}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Tests ({filteredPendingDonations.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Tests ({filteredCompletedTests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            {filteredPendingDonations.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No pending blood tests</p>
              </div>
            ) : (
              filteredPendingDonations.map((donation) => (
                <Card
                  key={donation.id}
                  className={`cursor-pointer ${selectedDonation?.id === donation.id ? "border-primary" : ""}`}
                  onClick={() => handleSelectDonation(donation)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{donation.donor.user.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {donation.donationId}</p>
                      </div>
                      <Badge variant="outline" className="font-medium text-primary">
                        {formatBloodType(donation.bloodType)}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Collected:</span>{" "}
                        {format(new Date(donation.actualDate), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span> {donation.volume} mL
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {filteredCompletedTests.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No completed blood tests</p>
              </div>
            ) : (
              filteredCompletedTests.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{donation.donor.user.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {donation.donationId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium text-primary">
                          {formatBloodType(donation.bloodType)}
                        </Badge>
                        {donation.status === "TESTED" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Passed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tested:</span>{" "}
                        {format(new Date(donation.updatedAt), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hemoglobin:</span>{" "}
                        {donation.testResults?.hemoglobin || "N/A"} g/dL
                      </div>
                    </div>
                    {donation.rejectionReason && (
                      <div className="mt-2 text-sm text-red-600">
                        <AlertTriangle className="inline-block mr-1 h-3 w-3" />
                        Reason: {donation.rejectionReason}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {selectedDonation ? (
          <Card>
            <CardHeader>
              <CardTitle>Blood Test Form</CardTitle>
              <CardDescription>Enter test results for donation ID: {selectedDonation.donationId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-4">
                  <Droplet className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">{selectedDonation.donor.user.name}</h3>
                    <p className="text-sm">
                      {formatBloodType(selectedDonation.bloodType)} • {selectedDonation.volume} mL
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Infectious Disease Screening</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hiv"
                      checked={testResults.hiv}
                      onCheckedChange={(checked) => setTestResults({ ...testResults, hiv: checked === true })}
                    />
                    <Label htmlFor="hiv" className="text-sm font-normal">
                      HIV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hepatitisB"
                      checked={testResults.hepatitisB}
                      onCheckedChange={(checked) => setTestResults({ ...testResults, hepatitisB: checked === true })}
                    />
                    <Label htmlFor="hepatitisB" className="text-sm font-normal">
                      Hepatitis B
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hepatitisC"
                      checked={testResults.hepatitisC}
                      onCheckedChange={(checked) => setTestResults({ ...testResults, hepatitisC: checked === true })}
                    />
                    <Label htmlFor="hepatitisC" className="text-sm font-normal">
                      Hepatitis C
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="syphilis"
                      checked={testResults.syphilis}
                      onCheckedChange={(checked) => setTestResults({ ...testResults, syphilis: checked === true })}
                    />
                    <Label htmlFor="syphilis" className="text-sm font-normal">
                      Syphilis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="malaria"
                      checked={testResults.malaria}
                      onCheckedChange={(checked) => setTestResults({ ...testResults, malaria: checked === true })}
                    />
                    <Label htmlFor="malaria" className="text-sm font-normal">
                      Malaria
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hemoglobin">Hemoglobin Level (g/dL)</Label>
                  <Input
                    id="hemoglobin"
                    type="number"
                    step="0.1"
                    min="8"
                    max="20"
                    placeholder="12.5"
                    value={testResults.hemoglobin}
                    onChange={(e) => setTestResults({ ...testResults, hemoglobin: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Normal range: 12.0-16.0 g/dL for women, 13.5-17.5 g/dL for men
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional observations..."
                    value={testResults.notes}
                    onChange={(e) => setTestResults({ ...testResults, notes: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedDonation(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTest}>Submit Test Results</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Select a donation to perform testing</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

