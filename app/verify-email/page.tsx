"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";


export default function VerifyEmailPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // 🔹 Handle access_token and refresh_token from email link
  useEffect(() => {
    const hash = window.location.hash; // e.g., #access_token=XYZ&refresh_token=ABC&type=signup
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1)); // remove #
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ data, error }) => { 
          if (error) {
            console.error("Failed to set session:", error.message);
            toast.error("Failed to verify email link.");
          } else {
            toast.success("Email verified! You are now logged in.");
          }

          // Clean URL
          window.history.replaceState({}, document.title, "/verify-email");
        });
    }
  }, []);

  // 🔹 Get pending email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    setPendingEmail(storedEmail);
  }, []);

  // 🔹 Check email verification status and redirect
  useEffect(() => {
    if (verified) return; // stop polling if already verified

    const checkVerification = async () => {
      setIsChecking(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user?.email_confirmed_at) {
        setVerified(true);
        localStorage.removeItem("pendingEmail");

        const role = user.user_metadata?.role || "client";
        if (role === "photographer") {
          router.push("/dashboard/setup");
        } else {
          router.push("/client/onboarding");
        }
      }
      setIsChecking(false);
    };

    checkVerification(); // check immediately
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [router, verified]);

  // 🔹 Resend verification email
  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendMessage(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
    });

    if (error) {
      console.error("Resend error:", error.message);
      setResendMessage("Failed to resend verification email. Try again.");
    } else {
      setResendMessage("Verification email sent again. Check your inbox!");
      toast.success("Verification email resent!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex justify-center items-center gap-2">
            <Mail className="w-6 h-6 text-primary" /> Verify your email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We’ve sent a verification link to{" "}
            <strong>{pendingEmail || "your email"}</strong>. <br />
            Please check your inbox and click the link to activate your account.
          </p>

          <div className="flex justify-center">
            {isChecking ? (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Checking verification status...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Once verified, you’ll be redirected automatically.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleResend} className="w-full">
              Resend verification email
            </Button>
            {resendMessage && (
              <p className="text-sm text-green-600">{resendMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
