"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface FormData {
  fullname: string;
  email: string;
  password: string;
  role: "client" | "photographer";
  confirmPassword: string;
}

interface FormErrors {          
  fullname?: string;
  email?: string;
  password?: string;
  role?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const defaultRole =
    (searchParams.get("role") as "client" | "photographer") || "client";

  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
    const { signup } = useAuth();

  // Handle input change
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.fullname) newErrors.fullname = "Full name is required";
    if (!formData.email) newErrors.email = "Please enter a valid email";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address.";
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password.";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  // Handle signup submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);

   
    try {
      const { confirmPassword, ...signupPayload } = formData;

   /*   await signup(
  formData.email,
  formData.password,
  formData.fullname,
  formData.role
);
      JSON.stringify(signupPayload) */

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorData: { error?: string } = {};

        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: responseText };
          }
        }

        throw new Error(errorData.error || 'Signup failed'); 
      }

      

      const userData = {
        email: formData.email,
        fullname: formData.fullname,
        role: formData.role,
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem("pendingEmail", formData.email);
      localStorage.setItem('savedUserName', formData.fullname);

      
      // Show confirmation message
      toast.success(
        "Signup successful! Please check your email to confirm your account."
      );

      // Optional redirect after signup confirmation
      setTimeout(() => {
        if(formData.role === "client") {
          router.push("/dashboard/client");
        } else {
          router.push("/dashboard/setup");
        }
      }, 2000);


      // Reset form
      setFormData({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: defaultRole,
      });

    } catch (error) {
      if (error instanceof Error) {
        console.group("🧩 Supabase Signup Error");
        console.error("Message:", error.message);
        console.groupEnd();
        toast.error(error.message);
        setErrors({ email: error.message });
      } else {
        console.error("Signup failed", error);
        toast.error("Signup failed. Please try again.");
        setErrors({ email: "Signup failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image 
              src="/logo.png" 
              alt="LensConnect Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-semibold">LensConnect</span>
          </Link>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join our community of photographers and clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={handleOnChange}
                />
                {errors.fullname && (
                  <p className="text-sm text-red-500">{errors.fullname}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleOnChange}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleOnChange}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleOnChange}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I want to</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: value as "client" | "photographer",
                    }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label
                      htmlFor="client"
                      className="font-normal cursor-pointer"
                    >
                      Hire a photographer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="photographer" id="photographer" />
                    <Label
                      htmlFor="photographer"
                      className="font-normal cursor-pointer"
                    >
                      Offer photography services
                    </Label>
                  </div>
                </RadioGroup>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
