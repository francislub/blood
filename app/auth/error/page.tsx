import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Droplet } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <Droplet className="h-12 w-12 text-red-500" />
        </div>
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Authentication Error</h1>
        <p className="mb-6 text-muted-foreground">
          There was a problem with your authentication. This could be due to an expired session or invalid credentials.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Signing In Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

