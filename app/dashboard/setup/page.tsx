"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { CheckCircle, Camera, Briefcase, User } from "lucide-react"

interface FormData {
  fullname: string
  bio: string
  location: string
  phoneNumber: string
  experience: number | string
  portfolio_url: string
  hourly_rate: number | string
  specialties: string[]
  availability: boolean
  email: string
  profile_image_url: string
  role: string
}

interface FormErrors {
  fullname?: string
  bio?: string
  location?: string
  phoneNumber?: string
  experience?: string
  email?: string
  portfolio_url?: string
  hourly_rate?: string
  role?: string
}

const availableSpecialties = [
  "Wedding",
  "Portrait",
  "Event",
  "Nature",
  "Fashion",
  "Sports",
  "Travel",
  "Product",
]

export default function SetupPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    bio: "",
    location: "",
    email: "",
    phoneNumber: "",
    experience: "",
    portfolio_url: "",
    hourly_rate: "",
    specialties: [],
    availability: true,
    profile_image_url: "",
    role: '',

  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Prefill from auth session first, then fall back to localStorage
  useEffect(() => {
    if (user) {
      // Primary source: session cookie via useAuth
      setFormData((prev) => ({
        ...prev,
        fullname: user.fullname || user.name || prev.fullname,
        email: user.email || prev.email,
        role: user.role || prev.role,
      }))
    } else {
      // Fallback: localStorage saved during signup
      const storedUser = localStorage.getItem("userData")
      if (storedUser) {
        try {
          const localUser = JSON.parse(storedUser)
          setFormData((prev) => ({
            ...prev,
            fullname: localUser.fullname || "",
            email: localUser.email || "",
            role: localUser.role || "",
          }))
        } catch {
          console.error("Failed to parse stored user data")
        }
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" || name === "hourly_rate" ? Number(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.fullname) newErrors.fullname = "Full name is required"
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.bio) newErrors.bio = "Bio is required"
      if (!formData.location) newErrors.location = "Location is required"
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required"
    } else if (step === 2) {
      if (!formData.experience) newErrors.experience = "Experience is required"
      if (!formData.portfolio_url) newErrors.portfolio_url = "Portfolio URL is required"
      if (!formData.hourly_rate) newErrors.hourly_rate = "Hourly rate is required"
      if (!formData.role) newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep((prev) => prev + 1)
  }

  const handleBack = () => setStep((prev) => prev - 1)


  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first.")
      return
    }

    if (!user) {
      toast.error("You must be logged in to upload.")
      return
    }

    setUploading(true)

    // Each user’s files go into a personal folder
    const filePath = `${user.id}/${Date.now()}_${imageFile.name}`

    const { data, error } = await supabase.storage
      .from("profile_image")
      .upload(filePath, imageFile)

    if (error) {
      toast.error("Upload failed: " + error.message)
    } else {
      const { data: publicData } = supabase.storage
        .from("profile_image")
        .getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        profile_image_url: publicData.publicUrl,
      }))
      toast.success("Image uploaded successfully!")
    }

    setUploading(false)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = validateStep()
    if (!isValid) return

    if (!user) {
      toast.error("You must be logged in to save setup.")
      return
    }

    try {
      const response = await fetch('/api/profiles', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(user.id),
          email: formData.email || user.email,
          fullname: formData.fullname,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
          location: formData.location,
          experience: Number(formData.experience),
          hourlyRate: Number(formData.hourly_rate),
          specialties: formData.specialties,
          portfolio_url: formData.portfolio_url,
          availability: formData.availability,
          profile_image_url: formData.profile_image_url,
          updatedAt: new Date(),
        }),
      })

      if (!response.ok) {
        // Replace line 229 with this to see the real error:
const errorData = await response.json().catch(() => ({}));
console.error("Server Response Error:", response.status, errorData);
throw new Error(errorData.error || `Profile setup failed with status ${response.status}`);

      }

      toast.success("Profile setup completed!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Profile setup error:", error)
      toast.error(error instanceof Error ? error.message : "Profile setup failed. Please try again.")
    }
  }

  const steps = [
    { id: 1, label: "Basic Info", icon: User },
    { id: 2, label: "Professional Details", icon: Briefcase },
    { id: 3, label: "Profile Image", icon: Camera },
  ]

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="py-6">
          <h1 className="font-bold text-black text-2xl md:text-3xl">Complete Your Profile</h1>
          <p className="text-gray-500 text-[16px] mt-2">
            Let’s set up your photographer profile for bookings
          </p>
        </div>

        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 flex justify-between items-center">
              Photographer Setup
              <span className="text-sm text-gray-500">Step {step} of {steps.length}</span>
            </CardTitle>
          </CardHeader>

          {/* Stepper */}
          <div className="flex items-center justify-between px-8 pb-6">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center text-center relative">
                <div
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ${step === s.id
                    ? "bg-black text-white"
                    : step > s.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {step > s.id ? <CheckCircle size={20} /> : <s.icon size={20} />}
                </div>
                <p className="text-xs mt-2 font-medium">{s.label}</p>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 h-0.5 w-full -translate-x-1/2 ${step > s.id ? "bg-green-500" : "bg-gray-300"
                      }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          name="fullname"
                          className="mt-2"
                          value={formData.fullname}
                          onChange={handleChange}
                        />
                        {errors.fullname && <p className="text-red-500 mt-2 text-sm">{errors.fullname}</p>}
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input
                          name="email"
                          className="mt-2"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-500 mt-2 text-sm">{errors.email}</p>}
                      </div>

                      <div>
                        <Label>Phone</Label>
                        <Input
                          name="phoneNumber"
                          className="mt-2"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                 
                        />
                        {errors.phoneNumber && <p className="text-red-500 mt-2 text-sm">{errors.phoneNumber}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input
                        name="location"
                        className="mt-2"
                        value={formData.location}
                        onChange={handleChange}
                      />
                      {errors.location && <p className="text-red-500 mt-2 text-sm">{errors.location}</p>}
                    </div>

                    <div>
                      <Label>Bio</Label>
                      <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} />
                      {errors.bio && <p className="text-red-500 mt-2 text-sm">{errors.bio}</p>}
                    </div>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Experience (Years)</Label>
                        <Input
                          name="experience"
                          className="mt-2"
                          value={formData.experience}
                          onChange={handleChange}
                        />
                        {errors.experience && <p className="text-red-500 mt-2 text-sm">{errors.experience}</p>}
                      </div>

                      <div>
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          name="hourly_rate"
                          className="mt-2"
                          value={formData.hourly_rate}
                          onChange={handleChange}
                        />
                        {errors.hourly_rate && <p className="text-red-500 mt-2 text-sm">{errors.hourly_rate}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Portfolio URL</Label>
                      <Input
                        name="portfolio_url"
                        className="mt-2"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                      />
                      {errors.portfolio_url && <p className="text-red-500 mt-2 text-sm">{errors.portfolio_url}</p>}
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Input
                        name="role"
                        className="mt-2"
                        value={formData.role}
                        onChange={handleChange}
                      />
                      {errors.role && <p className="text-red-500 mt-2 text-sm">{errors.role}</p>}
                    </div>


                    <div>
                      <Label>Specialties</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableSpecialties.map((s) => (
                          <Button
                            key={s}
                            type="button"
                            size="sm"
                            variant={formData.specialties.includes(s) ? "default" : "outline"}
                            onClick={() => toggleSpecialty(s)}
                            className="rounded-full"
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Label>Available for Bookings</Label>
                      <Switch
                        checked={formData.availability}
                        onCheckedChange={(checked) =>
                          setFormData((p) => ({ ...p, availability: checked }))
                        }
                      />
                    </div>
                  </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <>
                    <div>
                      <Label>Upload Profile Image</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                        <Button onClick={handleUpload} disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>

                    {formData.profile_image_url && (
                      <div className="flex justify-center">
                        <img
                          src={formData.profile_image_url}
                          alt="Profile Preview"
                          className="w-32 h-32 rounded-full mt-3 border shadow-md"
                        />
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
              {step < 3 && <Button onClick={handleNext}>Next</Button>}
              {step === 3 && <Button onClick={handleSubmit}>Finish Setup</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
