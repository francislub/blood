import type React from "react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Clock, Calendar, Droplet, HeartPulse } from "lucide-react"
import Link from "next/link"

export default function DonatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Donate Blood, Save Lives</h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg">
            Your blood donation can save up to three lives. Learn about the donation process, eligibility requirements,
            and how to schedule your donation.
          </p>
          <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-100">
              <Link href="/auth/register">Register as a Donor</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">The Donation Process</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <ProcessStep
              number="1"
              title="Registration"
              description="Complete a simple registration form with your personal details and medical history."
            />
            <ProcessStep
              number="2"
              title="Health Screening"
              description="Quick health check including temperature, blood pressure, pulse, and hemoglobin test."
            />
            <ProcessStep
              number="3"
              title="Blood Donation"
              description="The actual blood donation takes only 8-10 minutes. You'll donate about 450ml of blood."
            />
            <ProcessStep
              number="4"
              title="Refreshment & Rest"
              description="Enjoy refreshments and rest for 15 minutes before leaving to ensure you're feeling well."
            />
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Eligibility Requirements</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900">
                <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
                You Can Donate If:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <EligibilityItem>You are between 18 and 65 years old</EligibilityItem>
                <EligibilityItem>You weigh at least 50kg</EligibilityItem>
                <EligibilityItem>You are in good health</EligibilityItem>
                <EligibilityItem>
                  Your hemoglobin level is sufficient (12.5g/dL for women, 13.5g/dL for men)
                </EligibilityItem>
                <EligibilityItem>It has been at least 12 weeks since your last whole blood donation</EligibilityItem>
                <EligibilityItem>You have had something to eat and drink before donating</EligibilityItem>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900">
                <AlertCircle className="mr-2 h-6 w-6 text-red-500" />
                You Cannot Donate If:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <EligibilityItem>You have a cold, flu, or other illness</EligibilityItem>
                <EligibilityItem>You are pregnant or have given birth in the last 6 months</EligibilityItem>
                <EligibilityItem>You have had a tattoo or piercing in the last 4 months</EligibilityItem>
                <EligibilityItem>
                  You have traveled to certain countries with high risk of infectious diseases
                </EligibilityItem>
                <EligibilityItem>You are taking certain medications</EligibilityItem>
                <EligibilityItem>You have certain medical conditions (our staff will assess this)</EligibilityItem>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600">
            <p>
              If you're unsure about your eligibility, please contact us at +255 123 456 789 or visit our center for a
              consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Benefits of Donating Blood</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<HeartPulse className="h-10 w-10 text-red-500" />}
              title="Save Lives"
              description="Your donation can save up to three lives, helping accident victims, surgical patients, and those with blood disorders."
            />
            <BenefitCard
              icon={<Droplet className="h-10 w-10 text-red-500" />}
              title="Health Check"
              description="Receive a mini health check-up including blood pressure, pulse, and hemoglobin levels at no cost."
            />
            <BenefitCard
              icon={<Clock className="h-10 w-10 text-red-500" />}
              title="Blood Renewal"
              description="Donating blood helps stimulate the production of new blood cells, keeping your body healthy and functioning well."
            />
            <BenefitCard
              icon={<Calendar className="h-10 w-10 text-red-500" />}
              title="Regular Check-ups"
              description="Regular donors receive ongoing health monitoring and are notified of any abnormal findings."
            />
            <BenefitCard
              icon={<CheckCircle2 className="h-10 w-10 text-red-500" />}
              title="Reduced Health Risks"
              description="Regular blood donation is associated with reduced risk of heart attacks and lower blood viscosity."
            />
            <BenefitCard
              icon={<AlertCircle className="h-10 w-10 text-red-500" />}
              title="Community Impact"
              description="Become part of a community of donors making a real difference in people's lives every day."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mx-auto grid max-w-4xl gap-6">
            <FaqItem
              question="Does blood donation hurt?"
              answer="Most people feel only a slight pinch when the needle is inserted. The actual donation process is relatively painless."
            />
            <FaqItem
              question="How long does it take to replenish the blood I donate?"
              answer="Your body replaces the blood volume (plasma) within 24 hours. Red blood cells are replaced within 4-6 weeks, which is why we recommend waiting 12 weeks between donations."
            />
            <FaqItem
              question="Can I donate if I have high blood pressure?"
              answer="If your blood pressure is under control with medication and within acceptable limits on the day of donation, you may be eligible to donate. Our staff will check your blood pressure before donation."
            />
            <FaqItem
              question="What should I do after donating blood?"
              answer="After donating, we recommend resting for 15 minutes, drinking plenty of fluids, avoiding strenuous activities for 24 hours, and keeping the bandage on for at least 4 hours."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Make a Difference?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join our community of donors today and help ensure that blood is available for those who need it most.
          </p>
          <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-100">
              <Link href="/auth/register">Register Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
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

function EligibilityItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <span className="mr-2 mt-1 text-gray-400">•</span>
      <span>{children}</span>
    </li>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}

