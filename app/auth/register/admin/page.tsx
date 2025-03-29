"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import AdminRegistrationForm from "@/components/auth/admin-registration-form"

export default function AdminRegisterPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Register as an Administrator</CardTitle>
            <CardDescription>Create an administrator account to manage the blood bank system</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRegistrationForm />
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

