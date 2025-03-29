import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ArrowRight, Calendar, Droplet, Heart, Users, Shield, Stethoscope, FlaskRound } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-500 to-red-700 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Give Blood, Save Lives</h1>
                <p className="text-lg md:text-xl mb-6">
                  Your donation can make a difference in someone's life. Join our mission to ensure blood is available
                  for those in need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                    <Link href="/donate">Donate Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-red-600 hover:bg-white/10">
                    <Link href="/auth/register">Register as Donor</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img
                  src="/blood.png?height=400&width=500"
                  alt="Blood donation"
                  className="rounded-lg shadow-xl max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Droplet className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-4xl font-bold text-gray-900 mb-2">5,000+</h3>
                <p className="text-gray-600">Blood Donations</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-4xl font-bold text-gray-900 mb-2">1,200+</h3>
                <p className="text-gray-600">Active Donors</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-4xl font-bold text-gray-900 mb-2">3,500+</h3>
                <p className="text-gray-600">Lives Saved</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-4xl font-bold text-gray-900 mb-2">10+</h3>
                <p className="text-gray-600">Years of Service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Options Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Join Our Blood Bank System</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Register as one of our system users based on your role and help us save lives through efficient blood
                management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Donor Registration Card */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Droplet className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blood Donor</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Register as a blood donor to schedule donations, track your donation history, and receive reminders
                  for your next donation.
                </p>
                <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                  <Link href="/auth/register/donor">Register as Donor</Link>
                </Button>
              </div>

              {/* Administrator Registration Card */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Administrator</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Register as a blood bank administrator to manage the system, users, inventory, and generate reports.
                </p>
                <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                  <Link href="/auth/register/admin">Register as Admin</Link>
                </Button>
              </div>

              {/* Medical Officer Registration Card */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Medical Officer</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Register as a medical officer to request blood for patients, track blood usage, and manage patient
                  records.
                </p>
                <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                  <Link href="/auth/register/medical-officer">Register as Medical Officer</Link>
                </Button>
              </div>

              {/* Technician Registration Card */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FlaskRound className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blood Bank Technician</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Register as a technician to manage blood collection, processing, inventory, and handle blood requests.
                </p>
                <Button asChild className="w-full bg-purple-500 hover:bg-purple-600">
                  <Link href="/auth/register/technician">Register as Technician</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What We Do</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Our Blood Bank Management System ensures that blood is collected, tested, processed, and distributed
                efficiently to save lives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Droplet className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blood Collection</h3>
                <p className="text-gray-600">
                  We collect blood from voluntary donors following strict safety protocols to ensure quality and safety.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Testing & Processing</h3>
                <p className="text-gray-600">
                  Every unit of blood is rigorously tested and processed to ensure it's safe for transfusion to
                  patients.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Distribution</h3>
                <p className="text-gray-600">
                  We distribute blood and blood products to hospitals and medical facilities to ensure they're available
                  when needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Process Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">The Donation Process</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Donating blood is a simple and rewarding process that takes less than an hour of your time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="relative">
                  <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 z-10 relative">
                    1
                  </div>
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-red-200"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Registration</h3>
                <p className="text-gray-600">Complete a donor registration form and provide identification.</p>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 z-10 relative">
                    2
                  </div>
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-red-200"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Screening</h3>
                <p className="text-gray-600">
                  A brief health history and quick physical check to ensure it's safe for you to donate.
                </p>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 z-10 relative">
                    3
                  </div>
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-red-200"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Donation</h3>
                <p className="text-gray-600">The actual blood donation takes only about 8-10 minutes.</p>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 z-10 relative">
                    4
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Refreshment</h3>
                <p className="text-gray-600">Enjoy refreshments and relax for 15 minutes before leaving.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-red-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our community of donors and help save lives. Your blood donation can make a real difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-red-600 hover:bg-white/10">
                <Link href="/auth/register">
                  Register Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  )
}

