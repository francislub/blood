import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function RegisterSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
          <CardDescription>Thank you for registering as a blood donor</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your account has been created successfully. You can now sign in to access your donor dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            Note: Your account will be reviewed by our staff, and you will be notified when you are eligible to donate
            blood.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

