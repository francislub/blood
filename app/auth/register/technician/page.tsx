"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRound } from "lucide-react"
import TechnicianRegistrationForm from "@/components/auth/technician-registration-form"

export default function TechnicianRegisterPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center">
              <FlaskRound className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Register as a Blood Bank Technician</CardTitle>
            <CardDescription>Create an account to manage blood collection, processing, and inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <TechnicianRegistrationForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline text-primary">
                Sign in
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              By registering, you agree to our{" "}
              <Link href="/terms" className="underline text-muted-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline text-muted-foreground">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

