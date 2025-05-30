"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Mail, Calendar, Plane } from "lucide-react"
import { apiService, type Flight, type BookingRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BookingFormProps {
  flight: Flight
  onBookingComplete?: (bookingId: number) => void
}

export function BookingForm({ flight, onBookingComplete }: BookingFormProps) {
  const [formData, setFormData] = useState({
    passengerName: "",
    passengerEmail: "",
    departureDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const bookingRequest: BookingRequest = {
        flightNumber: flight.flightNumber,
        passengerName: formData.passengerName,
        passengerEmail: formData.passengerEmail,
        departureDate: formData.departureDate,
      }

      const booking = await apiService.createBooking(bookingRequest)

      toast({
        title: "Booking Confirmed!",
        description: `Your booking for flight ${flight.flightNumber} has been confirmed.`,
      })

      if (onBookingComplete) {
        onBookingComplete(booking.id)
      }

      // Reset form
      setFormData({
        passengerName: "",
        passengerEmail: "",
        departureDate: "",
      })
    } catch (error) {
      console.error("Booking failed:", error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Book Flight {flight.flightNumber}
        </CardTitle>
        <CardDescription>
          {flight.departureCity} → {flight.arrivalCity} with {flight.airline}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passengerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Passenger Name
              </Label>
              <Input
                id="passengerName"
                name="passengerName"
                type="text"
                placeholder="Enter full name as on ID"
                value={formData.passengerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengerEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="passengerEmail"
                name="passengerEmail"
                type="email"
                placeholder="Enter email for booking confirmation"
                value={formData.passengerEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure Date
              </Label>
              <Input
                id="departureDate"
                name="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total Price:</span>
              <span className="text-2xl font-bold">${flight.price ? flight.price.toFixed(2) : "299.99"}</span>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
