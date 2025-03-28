import type React from "react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mx-auto max-w-3xl text-lg">
            Have questions about blood donation or our services? We're here to help. Reach out to us through any of the
            channels below.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={<MapPin className="h-10 w-10 text-red-500" />}
              title="Our Location"
              details={["123 Nyamagana Street", "Mwanza, Tanzania"]}
            />
            <ContactCard
              icon={<Phone className="h-10 w-10 text-red-500" />}
              title="Phone Numbers"
              details={["+255 123 456 789", "+255 987 654 321"]}
            />
            <ContactCard
              icon={<Mail className="h-10 w-10 text-red-500" />}
              title="Email Addresses"
              details={["info@nyamagana-bloodbank.org", "support@nyamagana-bloodbank.org"]}
            />
            <ContactCard
              icon={<Clock className="h-10 w-10 text-red-500" />}
              title="Opening Hours"
              details={["Monday - Friday: 8AM - 8PM", "Saturday: 9AM - 6PM", "Sunday: 10AM - 4PM"]}
            />
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Send Us a Message</h2>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" required />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Write your message here..." className="min-h-[150px]" required />
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Send Message
                </Button>
              </form>
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Find Us</h2>
              <div className="h-[400px] overflow-hidden rounded-lg bg-gray-200">
                {/* Placeholder for map - in a real application, you would embed a Google Map or similar here */}
                <div className="flex h-full items-center justify-center text-gray-500">
                  <p className="text-center">
                    Interactive Map
                    <br />
                    (Google Maps would be embedded here)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mx-auto grid max-w-4xl gap-6">
            <FaqItem
              question="How do I schedule a blood donation?"
              answer="You can schedule a blood donation by calling our center, using our online appointment system, or walking in during our operating hours. We recommend scheduling an appointment to minimize wait times."
            />
            <FaqItem
              question="What are the requirements to donate blood?"
              answer="Generally, donors must be at least 18 years old, weigh at least 50kg, and be in good health. There are some medical conditions and medications that may disqualify you from donating. Our staff will conduct a brief health screening before your donation."
            />
            <FaqItem
              question="How often can I donate blood?"
              answer="Whole blood donors can donate every 12 weeks (3 months). If you're donating plasma or platelets, you can donate more frequently - plasma every 2 weeks and platelets every 7 days."
            />
            <FaqItem
              question="How long does the donation process take?"
              answer="The entire process takes about 1 hour, including registration, health screening, and the donation itself. The actual blood collection only takes about 8-10 minutes."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ContactCard({ icon, title, details }: { icon: React.ReactNode; title: string; details: string[] }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
        <div className="space-y-1 text-gray-600">
          {details.map((detail, index) => (
            <p key={index}>{detail}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}

