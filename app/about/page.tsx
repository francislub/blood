import type React from "react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Droplet, Award, Users, Clock, Shield, HeartPulse } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">About Nyamagana Blood Bank</h1>
          <p className="mx-auto max-w-3xl text-lg">
            Dedicated to saving lives through blood donation since 2005. Learn more about our mission, values, and the
            impact we've made in our community.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="bg-red-600 p-4 text-white">
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700">
                  To ensure a safe and adequate blood supply for patients in need throughout our community by collecting
                  blood donations from volunteer donors, and to provide excellent service to donors, patients, and
                  healthcare providers.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-red-600 p-4 text-white">
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-700">
                  To be the leading blood bank in Tanzania, recognized for excellence in blood services, donor care, and
                  community engagement, ensuring that no patient goes without blood when needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Our Core Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              icon={<Shield className="h-10 w-10 text-red-500" />}
              title="Safety"
              description="We prioritize the safety of donors and recipients in all our processes and procedures."
            />
            <ValueCard
              icon={<Users className="h-10 w-10 text-red-500" />}
              title="Community"
              description="We believe in the power of community and work to foster a sense of belonging among donors."
            />
            <ValueCard
              icon={<Award className="h-10 w-10 text-red-500" />}
              title="Excellence"
              description="We strive for excellence in all aspects of our operations and service delivery."
            />
            <ValueCard
              icon={<HeartPulse className="h-10 w-10 text-red-500" />}
              title="Compassion"
              description="We approach our work with empathy and understanding for those we serve."
            />
            <ValueCard
              icon={<Clock className="h-10 w-10 text-red-500" />}
              title="Reliability"
              description="We are committed to being a dependable source of blood products for healthcare facilities at all times."
            />
            <ValueCard
              icon={<Droplet className="h-10 w-10 text-red-500" />}
              title="Integrity"
              description="We conduct our operations with honesty, transparency, and the highest ethical standards."
            />
            <ValueCard
              icon={<Droplet className="h-10 w-10 text-red-500" />}
              title="Integrity"
              description="We conduct our operations with honesty, transparency, and the highest ethical standards."
            />
          </div>
        </div>
      </section>

      {/* History */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Our History</h2>
            <div className="space-y-6 text-gray-700">
              <p>
                Nyamagana Blood Bank was established in 2005 in response to the growing need for a reliable blood supply
                in the Mwanza region. What began as a small facility with just five staff members has grown into one of
                the most trusted blood banks in Tanzania.
              </p>
              <p>
                Over the years, we have expanded our services, improved our facilities, and implemented state-of-the-art
                technologies to ensure the highest standards in blood collection, testing, and storage.
              </p>
              <p>
                In 2010, we launched our mobile donation program, bringing blood donation opportunities directly to
                communities, schools, and workplaces. By 2015, we had established partnerships with all major hospitals
                in the region, ensuring a steady supply of blood products to those in need.
              </p>
              <p>
                Today, Nyamagana Blood Bank serves thousands of patients annually and has a dedicated community of
                regular donors who help us fulfill our mission of saving lives through blood donation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Our Leadership Team</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <TeamMember
              name="Dr. Sarah Mwanza"
              position="Medical Director"
              description="With over 15 years of experience in transfusion medicine, Dr. Mwanza oversees all medical aspects of our operations."
            />
            <TeamMember
              name="John Makundi"
              position="Operations Manager"
              description="John ensures the smooth running of our facilities and coordinates our mobile donation drives throughout the region."
            />
            <TeamMember
              name="Dr. Elizabeth Nyerere"
              position="Laboratory Director"
              description="Dr. Nyerere leads our team of laboratory technicians, ensuring all blood products meet the highest safety standards."
            />
            <TeamMember
              name="Michael Simba"
              position="Community Outreach Coordinator"
              description="Michael works with local communities to raise awareness about blood donation and organize donation events."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function TeamMember({ name, position, description }: { name: string; position: string; description: string }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
          <div className="flex h-full items-center justify-center text-gray-400">Photo</div>
        </div>
        <h3 className="mb-1 text-xl font-bold text-gray-900">{name}</h3>
        <p className="mb-3 text-red-600">{position}</p>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

