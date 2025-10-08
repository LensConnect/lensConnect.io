"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [checking, setChecking] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkEmailVerification = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // If user is not logged in, return to login
        router.push("/login")
        return
      }

      if (user.email_confirmed_at) {
        // If email is verified, redirect to dashboard
        setIsVerified(true)
        setTimeout(() => router.push("/dashboard"), 2000)
      }

      setChecking(false)
    }

    checkEmailVerification()

    // 🔄 Listen for auth changes (like verification)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          const user = session?.user
          if (user?.email_confirmed_at) {
            setIsVerified(true)
            setTimeout(() => router.push("/dashboard"), 2000)
          }
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {checking ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Checking verification status...</p>
            </div>
          ) : isVerified ? (
            <p className="text-green-600 font-medium">
              ✅ Email verified! Redirecting to dashboard...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                We’ve sent a verification link to your email. Please confirm your
                address before continuing.
              </p>
              <Button
                onClick={() => supabase.auth.refreshSession()}
                className="w-full"
              >
                I’ve verified my email
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
