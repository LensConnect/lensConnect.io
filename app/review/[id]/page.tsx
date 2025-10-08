"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { mockBookings, mockPhotographers } from "@/lib/mock-data"

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [booking, setBooking] = useState<any>(null)
  const [photographer, setPhotographer] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    params.then(({ id }) => {
      setBookingId(id)
      const foundBooking = mockBookings.find((b) => b.id === id)
      setBooking(foundBooking)
      if (foundBooking) {
        const foundPhotographer = mockPhotographers.find((p) => p.userId === foundBooking.photographerId)
        setPhotographer(foundPhotographer)
      }
    })
  }, [params])

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user || !booking || !photographer) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Mock review submission
    console.log("[v0] Submitting review:", {
      bookingId: booking.id,
      photographerId: photographer.userId,
      rating,
      comment,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/bookings")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Leave a Review</h1>
          <p className="text-muted-foreground">Share your experience with {photographer.user.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How was your session?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted stroke-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell others about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" disabled={rating === 0 || comment.length < 20 || isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
