"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Printer, Calendar, Share2 } from "lucide-react"

export default function CertificatesPage() {
  // Mock data for certificates
  const certificates = [
    {
      id: "CERT-001-23",
      title: "Blood Donation Certificate",
      date: "2023-03-15",
      type: "DONATION",
      donationCount: 5,
      description: "Certificate of appreciation for your 5th blood donation",
    },
    {
      id: "CERT-002-22",
      title: "Regular Donor Recognition",
      date: "2022-12-10",
      type: "ACHIEVEMENT",
      description: "Certificate recognizing your commitment as a regular blood donor",
    },
    {
      id: "CERT-003-22",
      title: "Blood Donation Certificate",
      date: "2022-09-05",
      type: "DONATION",
      donationCount: 3,
      description: "Certificate of appreciation for your 3rd blood donation",
    },
    {
      id: "CERT-004-22",
      title: "Blood Donation Certificate",
      date: "2022-06-20",
      type: "DONATION",
      donationCount: 2,
      description: "Certificate of appreciation for your 2nd blood donation",
    },
    {
      id: "CERT-005-22",
      title: "First-Time Donor Certificate",
      date: "2022-03-15",
      type: "DONATION",
      donationCount: 1,
      description: "Certificate of appreciation for your first blood donation",
    },
  ]

  // Get badge variant based on certificate type
  const getCertificateBadgeVariant = (type: string) => {
    switch (type) {
      case "DONATION":
        return "default"
      case "ACHIEVEMENT":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">View and download your donation certificates</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="overflow-hidden">
            <div className="bg-primary/10 p-6">
              <div className="flex justify-center">
                <Award className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{certificate.title}</CardTitle>
                <Badge variant={getCertificateBadgeVariant(certificate.type)}>{certificate.type}</Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(certificate.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{certificate.description}</p>
              {certificate.type === "DONATION" && (
                <div className="mt-4 rounded-md bg-primary/5 p-4 text-center">
                  <p className="text-sm font-medium">Donation Count</p>
                  <p className="text-3xl font-bold text-primary">{certificate.donationCount}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Donation Impact</CardTitle>
          <CardDescription>The impact of your blood donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-4xl font-bold text-primary">{certificates.length}</div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-4xl font-bold text-primary">{certificates.length * 450} ml</div>
              <p className="text-sm text-muted-foreground">Total Blood Volume</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-4xl font-bold text-primary">{certificates.length * 3}</div>
              <p className="text-sm text-muted-foreground">Lives Potentially Saved</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Each blood donation can save up to 3 lives. Your donations have made a significant impact in your
              community.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard/schedule">Schedule Your Next Donation</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

