import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Droplet, Users, Calendar, Award, ArrowRight, Heart, Activity, Clock } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-500 to-red-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Donate Blood, <span className="text-red-200">Save Lives</span>
              </h1>
              <p className="text-lg md:text-xl">
                Join Nyamagana Blood Bank's mission to ensure blood supply for those in need. Your donation can save up
                to three lives.
              </p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-100">
                  <Link href="/auth/register">Become a Donor</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="hidden items-center justify-center md:flex">
              <div className="relative h-80 w-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Droplet className="h-40 w-40 text-white" />
                </div>
                <div className="absolute inset-0 animate-spin-slow rounded-full border-b-4 border-t-4 border-white opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/10"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Droplet className="h-10 w-10 text-red-500" />}
              title="10,000+"
              description="Blood Donations"
            />
            <StatCard icon={<Users className="h-10 w-10 text-red-500" />} title="5,000+" description="Regular Donors" />
            <StatCard icon={<Heart className="h-10 w-10 text-red-500" />} title="30,000+" description="Lives Saved" />
            <StatCard icon={<Activity className="h-10 w-10 text-red-500" />} title="8" description="Blood Types" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">About Nyamagana Blood Bank</h2>
            <p className="mb-10 text-lg text-gray-600">
              Nyamagana Blood Bank is dedicated to providing safe, quality blood products to healthcare facilities
              throughout the region. Our mission is to ensure that blood is available to anyone who needs it, and to
              inspire people to donate regularly.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Award className="h-10 w-10 text-red-500" />}
              title="Quality Assurance"
              description="We maintain the highest standards in blood collection, testing, and storage to ensure safety."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-red-500" />}
              title="Regular Drives"
              description="We organize regular blood donation drives in communities, schools, and workplaces."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-red-500" />}
              title="24/7 Availability"
              description="Our blood bank operates round the clock to meet emergency blood requirements."
            />
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl">The Donation Process</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <ProcessStep
              number="1"
              title="Registration"
              description="Complete a simple registration form with your personal details."
            />
            <ProcessStep
              number="2"
              title="Screening"
              description="Quick health check and hemoglobin test to ensure you're eligible to donate."
            />
            <ProcessStep number="3" title="Donation" description="The actual blood donation takes only 8-10 minutes." />
            <ProcessStep
              number="4"
              title="Refreshment"
              description="Enjoy refreshments and rest for 15 minutes before leaving."
            />
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/auth/register">
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Make a Difference?</h2>
            <p className="mb-8 text-lg">
              Your blood donation can be the lifeline for someone in need. Join our community of donors today.
            </p>
            <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-100">
                <Link href="/auth/register">Become a Donor</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function StatCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

