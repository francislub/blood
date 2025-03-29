import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Droplet } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <Droplet className="h-12 w-12 text-red-500" />
        </div>
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Registration Successful!</h1>
        <p className="mb-6 text-muted-foreground">
          Thank you for registering with Nyamagana Blood Bank. Your account has been created successfully.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign In to Your Account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

