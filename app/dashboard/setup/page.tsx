"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, CheckCircle2 } from "lucide-react"

const availableSpecialties = [
  "Events",
  "Portraits",
  "Products",
  "Real Estate",
  "Fashion",
  "Family",
  "Weddings",
  "Commercial",
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])

  const progress = (step / 3) * 100

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty))
    } else {
      setSpecialties([...specialties, specialty])
    }
  }

  const handleComplete = () => {
    // In a real app, save to database
    console.log("[v0] Profile setup:", { bio, location, hourlyRate, specialties })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Let&apos;s set up your photographer profile to start getting bookings</p>
          <Progress value={progress} className="mt-4" />
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>Share your photography experience and style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="I'm a professional photographer specializing in..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button onClick={() => setStep(2)} disabled={!bio || !location} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Specialties</CardTitle>
              <CardDescription>Select the types of photography you offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={specialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm py-2 px-4"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                    {specialties.includes(specialty) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={specialties.length === 0} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Rate</CardTitle>
              <CardDescription>What&apos;s your hourly rate for bookings?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="150"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">You can always change this later in your settings</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={!hourlyRate} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
