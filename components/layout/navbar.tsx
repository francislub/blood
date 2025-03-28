"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Droplet, Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth/") || pathname.startsWith("/dashboard")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Droplet className="h-8 w-8 text-red-600" />
          <span className="text-xl font-bold">Nyamagana Blood Bank</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-6 md:flex">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/donate">Donate</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="hidden space-x-2 md:flex">
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 pb-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
              About Us
            </MobileNavLink>
            <MobileNavLink href="/donate" onClick={() => setIsMenuOpen(false)}>
              Donate
            </MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </MobileNavLink>
            <div className="flex flex-col space-y-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-red-600 ${
        isActive ? "text-red-600" : "text-gray-600"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`py-2 text-base font-medium transition-colors hover:text-red-600 ${
        isActive ? "text-red-600" : "text-gray-600"
      }`}
    >
      {children}
    </Link>
  )
}

