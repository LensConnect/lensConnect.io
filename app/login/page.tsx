"use client";

import { useState,useEffect  } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { profile } from "console";

interface FormData {
  email: string;
  password: string;
  role:string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "", role: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setFormData({
          email: parsed.email || "",
          password: parsed.password || "", 
          role: parsed.role || "",
        });
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }
  }, []);

 useEffect(()=>{
  const userData = localStorage.getItem("userData");
  if(userData){
    try{
      const parsed = JSON.parse(userData);
      setFormData((prev) => ({...prev, role: parsed.role || ""}))
    }catch(err){
    console.error("Failed to parse user data:", err);
  }
  }
 },[])

  const validate = () => {
    const errors: FormErrors = {};
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      

      if (error) {
        setFormErrors((prev) => ({ ...prev, general: error.message }));
        toast.error(error.message);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", formData.email)
        .single();

      if (profileError || !profileData) {
        setFormErrors((prev) => ({ ...prev, general: "Failed to fetch user profile." }));
        toast.error("Failed to fetch user profile.");
        return;
      }

      const role = profileData.role;

      toast.success("Login successful 🎉");
      if (data.user) {
        localStorage.setItem("user_email", data.user.email || "");
        localStorage.setItem("user_id", data.user.id);
       
      }

     
     if(role === "photographer"){
      router.push("/dashboard");
     }else{
      router.push("client/onboarding");
     }
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: "Login failed. Please try again." }));
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 to-slate-300">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold">LensConnect</span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Log in to your account to continue
          </p>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              {formErrors.general && (
                <p className="text-red-500 text-xs mt-2">{formErrors.general}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don’t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}