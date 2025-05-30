"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plane, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiService, type Booking } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const allBookings = await apiService.getAllBookings()
        // Show only the 3 most recent bookings
        const recentBookings = allBookings
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
          .slice(0, 3)
        setBookings(recentBookings)
      } catch (error) {
        console.error("Failed to load bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load recent bookings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [toast])

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Recent Bookings</CardTitle>
            <CardDescription>Your latest flight reservations</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Recent Bookings</CardTitle>
          <CardDescription>Your latest flight reservations</CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings found</p>
            <p className="text-sm">Start by searching for flights above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{booking.flightNumber}</Badge>
                      <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>{booking.status}</Badge>
                    </div>
                    <div className="font-medium">Flight {booking.flightNumber}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {booking.passengerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.departureDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Booked {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
