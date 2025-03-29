"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Microscope, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for blood testing
const mockBloodTests = [
  {
    id: "1",
    unitNumber: "BU-001",
    bloodType: "A_POSITIVE",
    donorName: "John Doe",
    collectionDate: "2023-06-10",
    testDate: "2023-06-11",
    status: "COMPLETED",
    results: {
      hiv: "NEGATIVE",
      hepatitisB: "NEGATIVE",
      hepatitisC: "NEGATIVE",
      syphilis: "NEGATIVE",
      malaria: "NEGATIVE",
    },
  },
  {
    id: "2",
    unitNumber: "BU-002",
    bloodType: "O_NEGATIVE",
    donorName: "Jane Smith",
    collectionDate: "2023-06-12",
    testDate: "2023-06-13",
    status: "PENDING",
    results: null,
  },
  {
    id: "3",
    unitNumber: "BU-003",
    bloodType: "B_POSITIVE",
    donorName: "Robert Johnson",
    collectionDate: "2023-06-14",
    testDate: "2023-06-15",
    status: "FAILED",
    results: {
      hiv: "NEGATIVE",
      hepatitisB: "POSITIVE",
      hepatitisC: "NEGATIVE",
      syphilis: "NEGATIVE",
      malaria: "NEGATIVE",
    },
  },
]

export default function BloodTestingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bloodTests, setBloodTests] = useState(mockBloodTests)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [testResults, setTestResults] = useState({
    hiv: "NEGATIVE",
    hepatitisB: "NEGATIVE",
    hepatitisC: "NEGATIVE",
    syphilis: "NEGATIVE",
    malaria: "NEGATIVE",
  })

  useEffect(() => {
    // Only blood bank technicians can access this page
    if (
      status === "authenticated" &&
      session?.user?.role !== "BLOOD_BANK_TECHNICIAN" &&
      session?.user?.role !== "ADMIN"
    ) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  // Handle test result submission
  const handleSubmitResults = () => {
    if (!selectedTest) return

    setIsLoading(true)
    // In a real app, you would make an API call here
    setTimeout(() => {
      // Update the test in the local state
      const updatedTests = bloodTests.map((test) => {
        if (test.id === selectedTest.id) {
          return {
            ...test,
            status: Object.values(testResults).includes("POSITIVE") ? "FAILED" : "COMPLETED",
            results: { ...testResults },
            testDate: new Date().toISOString().split("T")[0],
          }
        }
        return test
      })

      setBloodTests(updatedTests)
      setIsDialogOpen(false)
      setSelectedTest(null)
      setIsLoading(false)

      toast({
        title: "Test results saved",
        description: "The blood test results have been saved successfully.",
      })
    }, 1000)
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (
    status === "authenticated" &&
    (session?.user?.role === "BLOOD_BANK_TECHNICIAN" || session?.user?.role === "ADMIN")
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blood Testing</h1>
            <p className="text-muted-foreground">Manage and record blood test results</p>
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed Tests</TabsTrigger>
            <TabsTrigger value="failed">Failed Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Blood Tests</CardTitle>
                <CardDescription>Blood units awaiting testing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bloodTests.filter((test) => test.status === "PENDING").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No pending tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bloodTests
                        .filter((test) => test.status === "PENDING")
                        .map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.unitNumber}</TableCell>
                            <TableCell>{formatBloodType(test.bloodType)}</TableCell>
                            <TableCell>{test.donorName}</TableCell>
                            <TableCell>{new Date(test.collectionDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => {
                                  setSelectedTest(test)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Microscope className="mr-2 h-4 w-4" />
                                Record Results
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

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tests</CardTitle>
                <CardDescription>Blood units that passed all tests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bloodTests.filter((test) => test.status === "COMPLETED").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No completed tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bloodTests
                        .filter((test) => test.status === "COMPLETED")
                        .map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.unitNumber}</TableCell>
                            <TableCell>{formatBloodType(test.bloodType)}</TableCell>
                            <TableCell>{test.donorName}</TableCell>
                            <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Passed
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>
                                View Results
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

          <TabsContent value="failed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Failed Tests</CardTitle>
                <CardDescription>Blood units that failed one or more tests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bloodTests.filter((test) => test.status === "FAILED").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No failed tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bloodTests
                        .filter((test) => test.status === "FAILED")
                        .map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.unitNumber}</TableCell>
                            <TableCell>{formatBloodType(test.bloodType)}</TableCell>
                            <TableCell>{test.donorName}</TableCell>
                            <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className="flex items-center text-red-600">
                                <XCircle className="mr-1 h-4 w-4" />
                                Failed
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>
                                View Results
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

        {/* Dialog for recording test results */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Blood Test Results</DialogTitle>
              <DialogDescription>Enter the test results for blood unit {selectedTest?.unitNumber}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hiv">HIV Test</Label>
                  <Select
                    value={testResults.hiv}
                    onValueChange={(value) => setTestResults({ ...testResults, hiv: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGATIVE">Negative</SelectItem>
                      <SelectItem value="POSITIVE">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hepatitisB">Hepatitis B</Label>
                  <Select
                    value={testResults.hepatitisB}
                    onValueChange={(value) => setTestResults({ ...testResults, hepatitisB: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGATIVE">Negative</SelectItem>
                      <SelectItem value="POSITIVE">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hepatitisC">Hepatitis C</Label>
                  <Select
                    value={testResults.hepatitisC}
                    onValueChange={(value) => setTestResults({ ...testResults, hepatitisC: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGATIVE">Negative</SelectItem>
                      <SelectItem value="POSITIVE">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="syphilis">Syphilis</Label>
                  <Select
                    value={testResults.syphilis}
                    onValueChange={(value) => setTestResults({ ...testResults, syphilis: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGATIVE">Negative</SelectItem>
                      <SelectItem value="POSITIVE">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="malaria">Malaria</Label>
                <Select
                  value={testResults.malaria}
                  onValueChange={(value) => setTestResults({ ...testResults, malaria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEGATIVE">Negative</SelectItem>
                    <SelectItem value="POSITIVE">Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitResults} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Results"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for viewing test results */}
        {selectedTest && selectedTest.results && (
          <Dialog open={!!selectedTest && !isDialogOpen} onOpenChange={() => setSelectedTest(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Blood Test Results</DialogTitle>
                <DialogDescription>
                  Results for blood unit {selectedTest.unitNumber} ({formatBloodType(selectedTest.bloodType)})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Donor</Label>
                    <div className="rounded-md border p-2">{selectedTest.donorName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label>Test Date</Label>
                    <div className="rounded-md border p-2">{new Date(selectedTest.testDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Test Results</Label>
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span>HIV:</span>
                        <span
                          className={`flex items-center ${
                            selectedTest.results.hiv === "NEGATIVE" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTest.results.hiv === "NEGATIVE" ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          {selectedTest.results.hiv === "NEGATIVE" ? "Negative" : "Positive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hepatitis B:</span>
                        <span
                          className={`flex items-center ${
                            selectedTest.results.hepatitisB === "NEGATIVE" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTest.results.hepatitisB === "NEGATIVE" ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          {selectedTest.results.hepatitisB === "NEGATIVE" ? "Negative" : "Positive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hepatitis C:</span>
                        <span
                          className={`flex items-center ${
                            selectedTest.results.hepatitisC === "NEGATIVE" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTest.results.hepatitisC === "NEGATIVE" ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          {selectedTest.results.hepatitisC === "NEGATIVE" ? "Negative" : "Positive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Syphilis:</span>
                        <span
                          className={`flex items-center ${
                            selectedTest.results.syphilis === "NEGATIVE" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTest.results.syphilis === "NEGATIVE" ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          {selectedTest.results.syphilis === "NEGATIVE" ? "Negative" : "Positive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Malaria:</span>
                        <span
                          className={`flex items-center ${
                            selectedTest.results.malaria === "NEGATIVE" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {selectedTest.results.malaria === "NEGATIVE" ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          {selectedTest.results.malaria === "NEGATIVE" ? "Negative" : "Positive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedTest(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }

  return null
}

