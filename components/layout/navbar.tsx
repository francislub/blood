"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, Droplet, Moon, Sun, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(() => {
    // Hide navbar on auth pages, but show on dashboard
    setShowNavbar(!pathname?.startsWith("/auth/"))
  }, [pathname])

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  if (!showNavbar) {
    return null
  }

  // Determine if we're on a dashboard page
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <header
      className={`sticky top-0 z-40 w-full ${
        isScrolled ? "bg-white shadow-md dark:bg-gray-950" : "bg-white dark:bg-gray-950"
      } transition-all duration-200`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <Droplet className="h-6 w-6 text-red-500" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">BloodBank</span>
            </Link>
          </div>

          {/* Desktop Navigation - Public */}
          {!isDashboard && !session && (
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/donate">Donate</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </nav>
          )}

          {/* Desktop Navigation - Dashboard */}
          {isDashboard && session && (
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/dashboard">Dashboard</NavLink>
              {session.user.role === "ADMIN" && (
                <>
                  <NavLink href="/dashboard/users">Users</NavLink>
                  <NavLink href="/dashboard/reports">Reports</NavLink>
                </>
              )}
              {session.user.role === "DONOR" && (
                <>
                  <NavLink href="/dashboard/donation-history">Donations</NavLink>
                  <NavLink href="/dashboard/schedule">Schedule</NavLink>
                </>
              )}
              {session.user.role === "MEDICAL_OFFICER" && (
                <>
                  <NavLink href="/dashboard/patients">Patients</NavLink>
                  <NavLink href="/dashboard/requests">Requests</NavLink>
                  <NavLink href="/dashboard/transfusions">Transfusions</NavLink>
                </>
              )}
              {session.user.role === "BLOOD_BANK_TECHNICIAN" && (
                <>
                  <NavLink href="/dashboard/inventory">Inventory</NavLink>
                  <NavLink href="/dashboard/donations">Donations</NavLink>
                  <NavLink href="/dashboard/blood-testing">Testing</NavLink>
                </>
              )}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu (when logged in) */}
            {session && status === "authenticated" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline-block">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Login/Register Buttons (when logged out) */}
            {!session && status !== "loading" && (
              <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="outline">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-red-500 hover:bg-red-600">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <Droplet className="h-6 w-6 text-red-500 mr-2" />
                    <span className="font-bold text-xl">BloodBank</span>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {!isDashboard && !session && (
                      <>
                        <MobileNavLink href="/">Home</MobileNavLink>
                        <MobileNavLink href="/about">About</MobileNavLink>
                        <MobileNavLink href="/donate">Donate</MobileNavLink>
                        <MobileNavLink href="/contact">Contact</MobileNavLink>
                      </>
                    )}

                    {isDashboard && session && (
                      <>
                        <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                        {session.user.role === "ADMIN" && (
                          <>
                            <MobileNavLink href="/dashboard/users">Users</MobileNavLink>
                            <MobileNavLink href="/dashboard/reports">Reports</MobileNavLink>
                          </>
                        )}
                        {session.user.role === "DONOR" && (
                          <>
                            <MobileNavLink href="/dashboard/donation-history">Donations</MobileNavLink>
                            <MobileNavLink href="/dashboard/schedule">Schedule</MobileNavLink>
                          </>
                        )}
                        {session.user.role === "MEDICAL_OFFICER" && (
                          <>
                            <MobileNavLink href="/dashboard/patients">Patients</MobileNavLink>
                            <MobileNavLink href="/dashboard/requests">Requests</MobileNavLink>
                            <MobileNavLink href="/dashboard/transfusions">Transfusions</MobileNavLink>
                          </>
                        )}
                        {session.user.role === "BLOOD_BANK_TECHNICIAN" && (
                          <>
                            <MobileNavLink href="/dashboard/inventory">Inventory</MobileNavLink>
                            <MobileNavLink href="/dashboard/donations">Donations</MobileNavLink>
                            <MobileNavLink href="/dashboard/blood-testing">Testing</MobileNavLink>
                          </>
                        )}
                        <MobileNavLink href="/dashboard/profile">Profile</MobileNavLink>
                        <MobileNavLink href="/dashboard/settings">Settings</MobileNavLink>
                      </>
                    )}
                  </nav>

                  <div className="mt-auto space-y-4">
                    {session ? (
                      <Button onClick={handleSignOut} className="w-full bg-red-500 hover:bg-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/auth/signin">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                          <Link href="/auth/register">Register</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-red-500 ${
        isActive ? "text-red-500" : "text-gray-700 dark:text-gray-200"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`py-2 text-base font-medium transition-colors hover:text-red-500 ${
        isActive ? "text-red-500" : "text-gray-700 dark:text-gray-200"
      }`}
    >
      {children}
    </Link>
  )
}

