"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplet } from "lucide-react"
import DonorRegistrationForm from "@/components/auth/donor-registration-form"

export default function RegisterPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("donor")

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center">
              <Droplet className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join Nyamagana Blood Bank and help save lives</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="donor" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="donor">Register as a Donor</TabsTrigger>
              </TabsList>
              <TabsContent value="donor" className="pt-4">
                <DonorRegistrationForm />
              </TabsContent>
            </Tabs>
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

