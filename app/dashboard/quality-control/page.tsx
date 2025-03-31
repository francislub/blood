"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { AlertCircle, Search, Droplet, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"

export default function QualityControlPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bloodUnits, setBloodUnits] = useState([])
  const [inspectedUnits, setInspectedUnits] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [inspectionResults, setInspectionResults] = useState({
    appearance: "",
    temperature: "",
    packaging: "",
    labeling: "",
    expiryDate: "",
    notes: "",
    passed: true,
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

    fetchBloodUnits()
  }, [session, status, router])

  const fetchBloodUnits = async () => {
    setIsLoading(true)
    try {
      // Fetch blood units that need quality control
      const response = await fetch("/api/blood-units?status=AVAILABLE&qualityControl=false")
      if (!response.ok) throw new Error("Failed to fetch blood units")
      const data = await response.json()
      setBloodUnits(data)

      // Fetch blood units that have already been inspected
      const inspectedResponse = await fetch("/api/blood-units?qualityControl=true")
      if (!inspectedResponse.ok) throw new Error("Failed to fetch inspected units")
      const inspectedData = await inspectedResponse.json()
      setInspectedUnits(inspectedData)
    } catch (error) {
      console.error("Error fetching blood units:", error)
      toast({
        title: "Error",
        description: "Failed to load blood units",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit)
    // Reset inspection results
    setInspectionResults({
      appearance: "",
      temperature: "",
      packaging: "",
      labeling: "",
      expiryDate: "",
      notes: "",
      passed: true,
    })
  }

  const handleSubmit = async () => {
    if (!selectedUnit) return

    // Validate required fields
    if (
      !inspectionResults.appearance ||
      !inspectionResults.temperature ||
      !inspectionResults.packaging ||
      !inspectionResults.labeling
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/blood-units/${selectedUnit.id}/quality-control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionResults,
          status: inspectionResults.passed ? "AVAILABLE" : "DISCARDED",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit inspection results")
      }

      toast({
        title: "Success",
        description: "Quality control inspection completed successfully",
      })

      // Refresh blood units
      fetchBloodUnits()
      setSelectedUnit(null)
    } catch (error) {
      console.error("Error submitting inspection results:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit inspection results",
        variant: "destructive",
      })
    }
  }

  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  const formatComponentType = (type) => {
    if (!type) return "Whole Blood"
    return type.replace("_", " ")
  }

  const filteredBloodUnits = bloodUnits.filter(
    (unit) =>
      unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatBloodType(unit.bloodType).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatComponentType(unit.componentType).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredInspectedUnits = inspectedUnits.filter(
    (unit) =>
      unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatBloodType(unit.bloodType).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatComponentType(unit.componentType).toLowerCase().includes(searchQuery.toLowerCase()),
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
        <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
        <p className="text-muted-foreground">Inspect blood units to ensure quality and safety</p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by unit number, blood type, or component..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={fetchBloodUnits}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Inspection ({filteredBloodUnits.length})</TabsTrigger>
            <TabsTrigger value="inspected">Inspected Units ({filteredInspectedUnits.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            {filteredBloodUnits.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No blood units pending inspection</p>
              </div>
            ) : (
              filteredBloodUnits.map((unit) => (
                <Card
                  key={unit.id}
                  className={`cursor-pointer ${selectedUnit?.id === unit.id ? "border-primary" : ""}`}
                  onClick={() => handleSelectUnit(unit)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Unit #{unit.unitNumber}</h3>
                        <p className="text-sm text-muted-foreground">{formatComponentType(unit.componentType)}</p>
                      </div>
                      <Badge variant="outline" className="font-medium text-primary">
                        {formatBloodType(unit.bloodType)}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {format(new Date(unit.createdAt), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {format(new Date(unit.expiryDate), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span> {unit.volume} mL
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="inspected" className="space-y-4">
            {filteredInspectedUnits.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No inspected blood units</p>
              </div>
            ) : (
              filteredInspectedUnits.map((unit) => (
                <Card key={unit.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Unit #{unit.unitNumber}</h3>
                        <p className="text-sm text-muted-foreground">{formatComponentType(unit.componentType)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium text-primary">
                          {formatBloodType(unit.bloodType)}
                        </Badge>
                        {unit.status === "AVAILABLE" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Passed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Inspected:</span>{" "}
                        {format(new Date(unit.updatedAt), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {format(new Date(unit.expiryDate), "MMM d, yyyy")}
                      </div>
                    </div>
                    {unit.qualityControlNotes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {unit.qualityControlNotes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {selectedUnit ? (
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Inspection</CardTitle>
              <CardDescription>Inspect blood unit #{selectedUnit.unitNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-4">
                  <Droplet className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">{formatComponentType(selectedUnit.componentType)}</h3>
                    <p className="text-sm">
                      {formatBloodType(selectedUnit.bloodType)} • {selectedUnit.volume} mL
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {format(new Date(selectedUnit.expiryDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Inspection Checklist</h3>

                <div className="space-y-2">
                  <Label htmlFor="appearance">Visual Appearance</Label>
                  <Select
                    value={inspectionResults.appearance}
                    onValueChange={(value) => setInspectionResults({ ...inspectionResults, appearance: value })}
                  >
                    <SelectTrigger id="appearance">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HEMOLYZED">Hemolyzed</SelectItem>
                      <SelectItem value="CLOUDY">Cloudy</SelectItem>
                      <SelectItem value="CLOTTED">Clotted</SelectItem>
                      <SelectItem value="OTHER">Other (specify in notes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Storage Temperature</Label>
                  <Select
                    value={inspectionResults.temperature}
                    onValueChange={(value) => setInspectionResults({ ...inspectionResults, temperature: value })}
                  >
                    <SelectTrigger id="temperature">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPTIMAL">Optimal (1-6°C)</SelectItem>
                      <SelectItem value="ACCEPTABLE">Acceptable (within range)</SelectItem>
                      <SelectItem value="OUT_OF_RANGE">Out of range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging Integrity</Label>
                  <Select
                    value={inspectionResults.packaging}
                    onValueChange={(value) => setInspectionResults({ ...inspectionResults, packaging: value })}
                  >
                    <SelectTrigger id="packaging">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTACT">Intact</SelectItem>
                      <SelectItem value="MINOR_DEFECT">Minor defect</SelectItem>
                      <SelectItem value="COMPROMISED">Compromised</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labeling">Labeling Accuracy</Label>
                  <Select
                    value={inspectionResults.labeling}
                    onValueChange={(value) => setInspectionResults({ ...inspectionResults, labeling: value })}
                  >
                    <SelectTrigger id="labeling">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORRECT">Correct</SelectItem>
                      <SelectItem value="MINOR_ERROR">Minor error</SelectItem>
                      <SelectItem value="MAJOR_ERROR">Major error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional observations or issues..."
                    value={inspectionResults.notes}
                    onChange={(e) => setInspectionResults({ ...inspectionResults, notes: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="passed"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={inspectionResults.passed}
                    onChange={(e) => setInspectionResults({ ...inspectionResults, passed: e.target.checked })}
                  />
                  <Label htmlFor="passed" className="text-sm font-normal">
                    Unit passes quality control
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedUnit(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Complete Inspection
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Select a blood unit to inspect</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

