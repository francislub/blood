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
import { format } from "date-fns"
import { AlertCircle, Search, Droplet, Layers, CheckCircle2 } from "lucide-react"

const componentTypes = [
  { value: "RED_CELLS", label: "Red Blood Cells" },
  { value: "PLASMA", label: "Plasma" },
  { value: "PLATELETS", label: "Platelets" },
  { value: "CRYOPRECIPITATE", label: "Cryoprecipitate" },
]

export default function ComponentSeparationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [eligibleDonations, setEligibleDonations] = useState([])
  const [processedDonations, setProcessedDonations] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [components, setComponents] = useState([{ type: "", volume: "", expiryDays: "", notes: "" }])

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
      // Fetch donations that have been tested and are ready for component separation
      const response = await fetch("/api/donations?status=TESTED")
      if (!response.ok) throw new Error("Failed to fetch donations")
      const eligibleData = await response.json()
      setEligibleDonations(eligibleData)

      // Fetch donations that have already been processed
      const processedResponse = await fetch("/api/donations?status=PROCESSED")
      if (!processedResponse.ok) throw new Error("Failed to fetch processed donations")
      const processedData = await processedResponse.json()
      setProcessedDonations(processedData)
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
    // Reset components
    setComponents([{ type: "", volume: "", expiryDays: "", notes: "" }])
  }

  const addComponent = () => {
    setComponents([...components, { type: "", volume: "", expiryDays: "", notes: "" }])
  }

  const removeComponent = (index) => {
    if (components.length === 1) return
    const newComponents = [...components]
    newComponents.splice(index, 1)
    setComponents(newComponents)
  }

  const updateComponent = (index, field, value) => {
    const newComponents = [...components]
    newComponents[index] = { ...newComponents[index], [field]: value }
    setComponents(newComponents)
  }

  const handleSubmit = async () => {
    if (!selectedDonation) return

    // Validate components
    const invalidComponents = components.filter((comp) => !comp.type || !comp.volume || !comp.expiryDays)

    if (invalidComponents.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for each component",
        variant: "destructive",
      })
      return
    }

    // Validate total volume doesn't exceed donation volume
    const totalVolume = components.reduce((sum, comp) => sum + Number.parseFloat(comp.volume || 0), 0)
    if (totalVolume > selectedDonation.volume) {
      toast({
        title: "Error",
        description: `Total component volume (${totalVolume} mL) exceeds donation volume (${selectedDonation.volume} mL)`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/donations/${selectedDonation.id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          components: components.map((comp) => ({
            ...comp,
            volume: Number.parseFloat(comp.volume),
            expiryDays: Number.parseInt(comp.expiryDays),
            bloodType: selectedDonation.bloodType,
            donationId: selectedDonation.id,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process donation")
      }

      toast({
        title: "Success",
        description: "Donation processed successfully",
      })

      // Refresh donations
      fetchDonations()
      setSelectedDonation(null)
    } catch (error) {
      console.error("Error processing donation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      })
    }
  }

  const formatBloodType = (type) => {
    if (!type) return ""
    return type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")
  }

  const getDefaultExpiryDays = (componentType) => {
    switch (componentType) {
      case "RED_CELLS":
        return "42"
      case "PLASMA":
        return "365"
      case "PLATELETS":
        return "5"
      case "CRYOPRECIPITATE":
        return "365"
      default:
        return ""
    }
  }

  const filteredEligibleDonations = eligibleDonations.filter(
    (donation) =>
      donation.donor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatBloodType(donation.bloodType).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProcessedDonations = processedDonations.filter(
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
        <h1 className="text-3xl font-bold tracking-tight">Component Separation</h1>
        <p className="text-muted-foreground">Process whole blood donations into individual components</p>
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
        <Tabs defaultValue="eligible" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eligible">Eligible Donations ({filteredEligibleDonations.length})</TabsTrigger>
            <TabsTrigger value="processed">Processed Donations ({filteredProcessedDonations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="eligible" className="space-y-4">
            {filteredEligibleDonations.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No eligible donations for component separation</p>
              </div>
            ) : (
              filteredEligibleDonations.map((donation) => (
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
          <TabsContent value="processed" className="space-y-4">
            {filteredProcessedDonations.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No processed donations</p>
              </div>
            ) : (
              filteredProcessedDonations.map((donation) => (
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
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Processed
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed:</span>{" "}
                        {format(new Date(donation.updatedAt), "MMM d, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Components:</span> {donation.components?.length || 0}
                      </div>
                    </div>
                    {donation.components && donation.components.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {donation.components.map((component, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span>{component.type.replace("_", " ")}</span>
                            <span className="text-muted-foreground">{component.volume} mL</span>
                          </div>
                        ))}
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
              <CardTitle>Component Separation</CardTitle>
              <CardDescription>Process donation ID: {selectedDonation.donationId} into components</CardDescription>
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
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Blood Components</h3>
                  <Button size="sm" variant="outline" onClick={addComponent}>
                    Add Component
                  </Button>
                </div>

                {components.map((component, index) => (
                  <div key={index} className="space-y-3 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Component {index + 1}</h4>
                      {components.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeComponent(index)}>
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`component-type-${index}`}>Component Type</Label>
                        <Select
                          value={component.type}
                          onValueChange={(value) => {
                            updateComponent(index, "type", value)
                            updateComponent(index, "expiryDays", getDefaultExpiryDays(value))
                          }}
                        >
                          <SelectTrigger id={`component-type-${index}`}>
                            <SelectValue placeholder="Select component type" />
                          </SelectTrigger>
                          <SelectContent>
                            {componentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`component-volume-${index}`}>Volume (mL)</Label>
                        <Input
                          id={`component-volume-${index}`}
                          type="number"
                          min="1"
                          max={selectedDonation.volume}
                          placeholder="Volume in mL"
                          value={component.volume}
                          onChange={(e) => updateComponent(index, "volume", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`component-expiry-${index}`}>Expiry (days)</Label>
                        <Input
                          id={`component-expiry-${index}`}
                          type="number"
                          min="1"
                          max="365"
                          placeholder="Days until expiry"
                          value={component.expiryDays}
                          onChange={(e) => updateComponent(index, "expiryDays", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`component-notes-${index}`}>Notes (Optional)</Label>
                        <Input
                          id={`component-notes-${index}`}
                          placeholder="Additional notes"
                          value={component.notes}
                          onChange={(e) => updateComponent(index, "notes", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedDonation(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Process Donation</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Select a donation to process</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

