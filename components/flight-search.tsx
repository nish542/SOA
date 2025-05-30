"use client"

import type React from "react"
import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowRightLeft, Loader2, Users, Plane } from "lucide-react"
import { apiService, type Flight, type BookingRequest } from "@/lib/api"
import { useToastContext } from "@/components/ui/toast-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FlightSearchProps {
  onSearchResults?: (flights: Flight[]) => void
}

interface BookingFormState {
  passengerName: string;
  passengerEmail: string;
  phoneNumber: string;
}

// List of US domestic cities
const US_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Miami",
  "San Francisco",
  "Boston",
  "Seattle",
  "Denver",
  "Atlanta",
  "Dallas",
  "Houston",
  "Phoenix",
  "Las Vegas",
  "Orlando",
  "Detroit",
  "Minneapolis",
  "Philadelphia",
  "Charlotte",
  "Washington",
  "Baltimore"
];

export function FlightSearch({ onSearchResults }: FlightSearchProps) {
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    passengerName: "",
    passengerEmail: "",
    phoneNumber: "",
  })
  const [isBooking, setIsBooking] = useState(false)
  const { toast } = useToastContext()

  const calculateFlightDuration = (departureTime: string, arrivalTime: string) => {
    const departure = new Date(departureTime)
    const arrival = new Date(arrivalTime)
    const durationMs = arrival.getTime() - departure.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleBooking = async () => {
    if (!selectedFlight) return

    if (!selectedFlight.flight || !selectedFlight.departure || !selectedFlight.arrival || !selectedFlight.aircraft || !selectedFlight.airline) {
        toast({
            title: "Booking Failed",
            description: "Flight data is incomplete.",
            type: "error"
        });
        return;
    }

    setIsBooking(true)
    try {
      const bookingRequest: BookingRequest = {
        ...bookingForm,
        flightIata: selectedFlight.flight.iata,
        airlineName: selectedFlight.airline.name,
        departureAirport: selectedFlight.departure.iata,
        arrivalAirport: selectedFlight.arrival.iata,
        departureTerminal: selectedFlight.departure.terminal,
        arrivalTerminal: selectedFlight.arrival.terminal,
        flightDate: selectedFlight.flight_date,
        aircraftIata: selectedFlight.aircraft.iata,
      }

      const response = await apiService.createBooking(bookingRequest)
      
      toast({
        title: "Booking Confirmed",
        description: `Your booking has been confirmed. Booking ID: ${response.booking.id}`,
        type: "success"
      })

      // Reset form
      setBookingForm({
        passengerName: "",
        passengerEmail: "",
        phoneNumber: "",
      })
      setSelectedFlight(null)
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        type: "error"
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromCity || !toCity) {
      toast({
        title: "Error",
        description: "Please select both departure and destination cities",
        type: "error"
      })
      return
    }

    if (fromCity === toCity) {
      toast({
        title: "Error",
        description: "Departure and destination cities cannot be the same",
        type: "error"
      })
      return
    }

    setIsLoading(true)

    try {
      const flights = await apiService.searchFlights({
        fromCity: fromCity.toLowerCase(),
        toCity: toCity.toLowerCase(),
      })

      // Filter out flights with incomplete data for display and accurate count
      const validFlights = flights.filter(flight =>
        flight && flight.flight && flight.airline && flight.aircraft && flight.departure && flight.arrival
      );

      setFlights(validFlights);

      if (onSearchResults) {
        onSearchResults(validFlights);
      }

      if (validFlights.length === 0) {
        toast({
          title: "No Flights Available",
          description: "No flights available for the selected route. Note: Only US domestic flights for today are supported.",
          type: "info"
        })
      } else {
        toast({
          title: "Success",
          description: `Found ${validFlights.length} flights from ${fromCity} to ${toCity}`,
          type: "success"
        })
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search flights",
        type: "error"
      })
      setFlights([])
    } finally {
      setIsLoading(false)
    }
  }

  const swapCities = () => {
    const temp = fromCity
    setFromCity(toCity)
    setToCity(temp)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof BookingFormState) => {
    setBookingForm((prev: BookingFormState) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Search Flights</CardTitle>
          <CardDescription>Find the best flights for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Select value={fromCity} onValueChange={setFromCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="to">To</Label>
                <Select value={toCity} onValueChange={setToCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute -left-12 top-8 md:top-8 p-2"
                  onClick={swapCities}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Flights
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {flights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Flights</h2>
          {flights.map((flight, index) => (
            flight && flight.flight && flight.airline && flight.aircraft && flight.departure && flight.arrival ? (
            <Card key={flight.flight.iata || index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span className="font-semibold">{flight.airline.name} {flight.flight.number}</span>
                    <span className="text-sm text-muted-foreground">({flight.aircraft.iata})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-medium">{flight.departure.airport}</p>
                      <p className="text-sm">{formatTime(flight.departure.scheduled)}</p>
                      <p className="text-xs text-muted-foreground">Terminal {flight.departure.terminal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-medium">{flight.arrival.airport}</p>
                      <p className="text-sm">{formatTime(flight.arrival.scheduled)}</p>
                      <p className="text-xs text-muted-foreground">Terminal {flight.arrival.terminal}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Duration: {calculateFlightDuration(flight.departure.scheduled, flight.arrival.scheduled)}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedFlight(flight)}
                      variant="default"
                    >
                      Book Flight
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book Flight</DialogTitle>
                      <DialogDescription>
                        Enter passenger details to complete your booking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={bookingForm.passengerName}
                          onChange={(e) => handleInputChange(e, 'passengerName')}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingForm.passengerEmail}
                          onChange={(e) => handleInputChange(e, 'passengerEmail')}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={bookingForm.phoneNumber}
                          onChange={(e) => handleInputChange(e, 'phoneNumber')}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleBooking}
                        disabled={isBooking || !bookingForm.passengerName || !bookingForm.passengerEmail || !bookingForm.phoneNumber}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming Booking...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
             ) : null
          ))}
        </div>
      )}
    </div>
  )
}
