"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Facebook, Instagram, Twitter, Phone, Mail, MapPin, Clock } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()

  // Don't show footer on auth pages and dashboard
  if (pathname?.includes("/auth") || pathname?.includes("/dashboard")) {
    return null
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Droplet className="h-6 w-6 text-red-500" />
              <span className="font-bold text-xl">BloodBank</span>
            </div>
            <p className="text-gray-400 mb-4">
              We are dedicated to ensuring a safe and efficient blood supply for our community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-400 hover:text-white">
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-gray-400 hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <span className="text-gray-400">123 Main Street, Nyamagana, Mwanza, Tanzania</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span className="text-gray-400">+255 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-500" />
                <span className="text-gray-400">info@nyamaganabank.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-white">Monday - Friday</p>
                  <p className="text-gray-400">8:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-white">Saturday</p>
                  <p className="text-gray-400">9:00 AM - 4:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-white">Sunday</p>
                  <p className="text-gray-400">Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Nyamagana Blood Bank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

