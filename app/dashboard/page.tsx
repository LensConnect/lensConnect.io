"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ImageIcon,
  Settings,
} from "lucide-react"
import { mockBookings, mockPhotographers } from "@/lib/mock-data"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "photographer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "photographer") {
    return null
  }

  // Mock data for the current photographer
  const photographerProfile = mockPhotographers.find((p) => p.userId === user.id) || mockPhotographers[0]
  const photographerBookings = mockBookings.filter((b) => b.photographerId === photographerProfile.userId)

  const upcomingBookings = photographerBookings.filter((b) => b.status === "confirmed" && b.date > new Date())
  const pendingBookings = photographerBookings.filter((b) => b.status === "pending")
  const completedBookings = photographerBookings.filter((b) => b.status === "completed")

  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
  const thisMonthEarnings = completedBookings
    .filter((b) => {
      const bookingMonth = b.date.getMonth()
      const currentMonth = new Date().getMonth()
      return bookingMonth === currentMonth
    })
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard/portfolio">
                <ImageIcon className="h-4 w-4 mr-2" />
                Manage Portfolio
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From {completedBookings.length} completed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${thisMonthEarnings.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{photographerProfile.rating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">{photographerProfile.reviewCount} reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting your response</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showActions />)
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length > 0 ? (
              completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed bookings yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BookingCard({ booking, showActions = false }: { booking: any; showActions?: boolean }) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{booking.type}</h3>
                <p className="text-sm text-muted-foreground">{booking.location}</p>
              </div>
              <Badge variant="secondary" className={`${status.bg} ${status.color} border-0`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.date.toLocaleDateString("en-US", {
                    weekday: "short",
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${booking.totalPrice}</span>
              </div>
            </div>

            {booking.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{booking.notes}</p>
            )}
          </div>

          {showActions && (
            <div className="flex md:flex-col gap-2">
              <Button size="sm" className="flex-1 md:flex-none">
                Accept
              </Button>
              <Button size="sm" variant="outline" className="flex-1 md:flex-none bg-transparent">
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
