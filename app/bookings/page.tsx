"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { mockBookings, mockPhotographers } from "@/lib/mock-data"
import Link from "next/link"

export default function BookingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  // Mock bookings for the current user
  const userBookings = mockBookings.filter((b) => b.clientId === user.id || b.clientId === "c1")

  const upcomingBookings = userBookings.filter((b) => b.status === "confirmed" && b.date > new Date())
  const pendingBookings = userBookings.filter((b) => b.status === "pending")
  const pastBookings = userBookings.filter((b) => b.status === "completed" || b.date < new Date())

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your photography sessions</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Button asChild className="mt-4">
                  <Link href="/search">Find a Photographer</Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending bookings</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} showReview />)
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No past bookings</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ClientBookingCard({ booking, showReview = false }: { booking: any; showReview?: boolean }) {
  const photographer = mockPhotographers.find((p) => p.userId === booking.photographerId)

  if (!photographer) return null

  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
    confirmed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Confirmed" },
    completed: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", label: "Completed" },
    cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
  }

  const status = statusConfig[booking.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Photographer Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={photographer.user.avatar || "/placeholder.svg"} alt={photographer.user.name} />
              <AvatarFallback>{photographer.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{photographer.user.name}</h3>
              <p className="text-sm text-muted-foreground">{booking.type}</p>
              <Badge variant="secondary" className={`${status.bg} ${status.color} border-0 mt-2`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} ({booking.duration}
                  h)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{booking.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${booking.totalPrice}</span>
              </div>
            </div>

            {booking.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{booking.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2 lg:w-40">
            <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
              <Link href={`/messages?to=${photographer.userId}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
            {showReview && booking.status === "completed" && (
              <Button size="sm" asChild className="flex-1">
                <Link href={`/review/${booking.id}`}>
                  <Star className="h-4 w-4 mr-2" />
                  Review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
