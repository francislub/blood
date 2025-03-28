"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { BarChart, LineChart, PieChart, Download, FileText, Calendar, Printer } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("inventory")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and view blood bank reports</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setReportType("inventory")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Report</CardTitle>
            <BarChart className={`h-4 w-4 ${reportType === "inventory" ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">423 units</div>
            <p className="text-xs text-muted-foreground">Current blood inventory status</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setReportType("donations")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donation Report</CardTitle>
            <LineChart className={`h-4 w-4 ${reportType === "donations" ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 donations</div>
            <p className="text-xs text-muted-foreground">Last 30 days donation activity</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setReportType("usage")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Report</CardTitle>
            <PieChart className={`h-4 w-4 ${reportType === "usage" ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98 transfusions</div>
            <p className="text-xs text-muted-foreground">Blood usage in last 30 days</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setReportType("expiry")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Report</CardTitle>
            <Calendar className={`h-4 w-4 ${reportType === "expiry" ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 units</div>
            <p className="text-xs text-muted-foreground">Expiring in next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full md:w-64">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="donations">Donation Report</SelectItem>
                    <SelectItem value="usage">Usage Report</SelectItem>
                    <SelectItem value="expiry">Expiry Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last 3 months</SelectItem>
                    <SelectItem value="year">Last 12 months</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </div>
              )}

              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {reportType === "inventory" && "Blood Inventory Report"}
                {reportType === "donations" && "Blood Donation Report"}
                {reportType === "usage" && "Blood Usage Report"}
                {reportType === "expiry" && "Blood Expiry Report"}
              </CardTitle>
              <CardDescription>
                {dateRange === "today" && "Data for today"}
                {dateRange === "week" && "Data for the last 7 days"}
                {dateRange === "month" && "Data for the last 30 days"}
                {dateRange === "quarter" && "Data for the last 3 months"}
                {dateRange === "year" && "Data for the last 12 months"}
                {dateRange === "custom" &&
                  startDate &&
                  endDate &&
                  `Data from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                  <div className="h-[400px] w-full rounded-md border flex items-center justify-center">
                    {reportType === "inventory" && <BarChart className="h-16 w-16 text-muted-foreground" />}
                    {reportType === "donations" && <LineChart className="h-16 w-16 text-muted-foreground" />}
                    {reportType === "usage" && <PieChart className="h-16 w-16 text-muted-foreground" />}
                    {reportType === "expiry" && <Calendar className="h-16 w-16 text-muted-foreground" />}
                    <span className="ml-2 text-muted-foreground">Chart visualization would appear here</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This chart shows the {reportType} data for the selected time period. In a real implementation, this
                    would be an interactive chart with detailed data visualization.
                  </p>
                </TabsContent>

                <TabsContent value="table">
                  <div className="rounded-md border">
                    <div className="flex items-center justify-between border-b p-4">
                      <div className="font-medium">Data Table</div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        A detailed data table would be displayed here with columns relevant to the selected report type.
                      </p>
                      <div className="mt-4 h-[300px] rounded-md border border-dashed flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Table data would appear here</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="summary">
                  <div className="space-y-4">
                    {reportType === "inventory" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Total Blood Units</div>
                            <div className="mt-1 text-2xl font-bold">423</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Low Inventory Types</div>
                            <div className="mt-1 text-2xl font-bold">2</div>
                          </div>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="text-sm font-medium">Blood Type Distribution</div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span>A+</span>
                              <span>85 units (20.1%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>A-</span>
                              <span>32 units (7.6%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>B+</span>
                              <span>76 units (18.0%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>B-</span>
                              <span>28 units (6.6%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>AB+</span>
                              <span>42 units (9.9%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>AB-</span>
                              <span>15 units (3.5%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>O+</span>
                              <span>95 units (22.5%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>O-</span>
                              <span>50 units (11.8%)</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {reportType === "donations" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Total Donations</div>
                            <div className="mt-1 text-2xl font-bold">156</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">New Donors</div>
                            <div className="mt-1 text-2xl font-bold">42</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Returning Donors</div>
                            <div className="mt-1 text-2xl font-bold">114</div>
                          </div>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="text-sm font-medium">Donation Trends</div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Week 1</span>
                              <span>38 donations</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Week 2</span>
                              <span>42 donations</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Week 3</span>
                              <span>35 donations</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Week 4</span>
                              <span>41 donations</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {reportType === "usage" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Total Transfusions</div>
                            <div className="mt-1 text-2xl font-bold">98</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Units Used</div>
                            <div className="mt-1 text-2xl font-bold">142</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Patients Served</div>
                            <div className="mt-1 text-2xl font-bold">87</div>
                          </div>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="text-sm font-medium">Usage by Department</div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Emergency</span>
                              <span>48 units (33.8%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Surgery</span>
                              <span>36 units (25.4%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Obstetrics</span>
                              <span>22 units (15.5%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Oncology</span>
                              <span>18 units (12.7%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Other</span>
                              <span>18 units (12.7%)</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {reportType === "expiry" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Expiring Soon</div>
                            <div className="mt-1 text-2xl font-bold">12 units</div>
                          </div>
                          <div className="rounded-md border p-4">
                            <div className="text-sm font-medium">Expired Last Month</div>
                            <div className="mt-1 text-2xl font-bold">8 units</div>
                          </div>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="text-sm font-medium">Expiring Units by Blood Type</div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span>A+</span>
                              <span>3 units</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>B+</span>
                              <span>2 units</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>AB-</span>
                              <span>1 unit</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>O+</span>
                              <span>4 units</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>O-</span>
                              <span>2 units</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

