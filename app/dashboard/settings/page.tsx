"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, Shield, Globe, Clock, Save, User, Building } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [lowInventoryAlerts, setLowInventoryAlerts] = useState(true)
  const [expiryAlerts, setExpiryAlerts] = useState(true)
  const [donationReminders, setDonationReminders] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your blood bank system settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input id="system-name" defaultValue="Nyamagana Blood Bank Management System" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="Africa/Dar_es_Salaam">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Dar_es_Salaam">East Africa Time (EAT)</SelectItem>
                    <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                    <SelectItem value="Africa/Johannesburg">South Africa Standard Time (SAST)</SelectItem>
                    <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                    <SelectItem value="Africa/Cairo">Eastern European Time (EET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="DD/MM/YYYY">
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blood Donation Settings</CardTitle>
              <CardDescription>Configure blood donation related settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donation-interval">Minimum Donation Interval (days)</Label>
                <Input id="donation-interval" type="number" defaultValue="56" />
                <p className="text-xs text-muted-foreground">Minimum number of days required between donations</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-expiry">Blood Unit Expiry (days)</Label>
                <Input id="blood-expiry" type="number" defaultValue="35" />
                <p className="text-xs text-muted-foreground">
                  Number of days after which blood units are considered expired
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="low-inventory">Low Inventory Threshold</Label>
                <Input id="low-inventory" type="number" defaultValue="10" />
                <p className="text-xs text-muted-foreground">
                  Number of units below which a blood type is considered low in inventory
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Notification Types</h3>
                <div className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="low-inventory-alerts">Low Inventory Alerts</Label>
                    </div>
                    <Switch
                      id="low-inventory-alerts"
                      checked={lowInventoryAlerts}
                      onCheckedChange={setLowInventoryAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="expiry-alerts">Expiry Alerts</Label>
                    </div>
                    <Switch id="expiry-alerts" checked={expiryAlerts} onCheckedChange={setExpiryAlerts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="donation-reminders">Donation Reminders</Label>
                    </div>
                    <Switch
                      id="donation-reminders"
                      checked={donationReminders}
                      onCheckedChange={setDonationReminders}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="admin@nyamagana-bloodbank.org" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-phone">Notification Phone Number</Label>
                <Input id="notification-phone" type="tel" defaultValue="+255 123 456 789" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger>
                    <SelectValue placeholder="Select password policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (minimum 8 characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, letters & numbers)</SelectItem>
                    <SelectItem value="strong">Strong (8+ chars, mixed case, numbers & symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" />
                <p className="text-xs text-muted-foreground">
                  Time of inactivity after which users are automatically logged out
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-attempts">Maximum Login Attempts</Label>
                <Input id="login-attempts" type="number" defaultValue="5" />
                <p className="text-xs text-muted-foreground">
                  Number of failed login attempts before account is locked
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for administrative accounts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Access Logs</h3>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between border-b p-4">
                    <div className="font-medium">System Access Logs</div>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      System access logs are retained for 90 days. You can download or view logs from the security
                      dashboard.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Shield className="mr-2 h-4 w-4" />
                      View Security Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Configure your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Nyamagana District Hospital" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-type">Organization Type</Label>
                <Select defaultValue="hospital">
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="blood-bank">Blood Bank</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="research">Research Institution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Textarea id="org-address" defaultValue="123 Hospital Road, Nyamagana District, Mwanza, Tanzania" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone Number</Label>
                  <Input id="org-phone" defaultValue="+255 28 250 0512" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input id="org-email" type="email" defaultValue="info@nyamagana-hospital.org" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input id="org-website" type="url" defaultValue="https://www.nyamagana-hospital.org" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-license">License Number</Label>
                <Input id="org-license" defaultValue="TZ-MED-BB-2023-1234" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Building className="mr-2 h-4 w-4" />
                Update Organization Info
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Configure primary contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Primary Contact Name</Label>
                <Input id="contact-name" defaultValue="Dr. Sarah Kimaro" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-position">Position</Label>
                <Input id="contact-position" defaultValue="Medical Director" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input id="contact-phone" defaultValue="+255 765 432 109" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" defaultValue="s.kimaro@nyamagana-hospital.org" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <User className="mr-2 h-4 w-4" />
                Update Contact Info
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system maintenance and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access during updates
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {maintenanceMode && (
                <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Maintenance Mode Active
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          When maintenance mode is active, only administrators can access the system. All other users
                          will see a maintenance page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Automatic Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                <Input id="backup-retention" type="number" defaultValue="30" />
                <p className="text-xs text-muted-foreground">Number of days to keep automatic backups</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">System Information</h3>
                <div className="rounded-md border p-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version</span>
                      <span className="text-sm">2.5.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Update</span>
                      <span className="text-sm">June 10, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Database Size</span>
                      <span className="text-sm">1.2 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Backup</span>
                      <span className="text-sm">Today, 03:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline">
                  <Globe className="mr-2 h-4 w-4" />
                  Check for Updates
                </Button>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

