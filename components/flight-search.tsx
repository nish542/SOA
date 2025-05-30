"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

export function FlightSearch({ onSearchResults }: FlightSearchProps) {
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [bookingForm, setBookingForm] = useState({
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

  useEffect(() => {
    const loadCities = async () => {
      try {
        const supportedCities = await apiService.getSupportedCities()
        setCities(supportedCities)
      } catch (error) {
        console.error("Failed to load cities:", error)
        toast({
          title: "Error",
          description: "Failed to load supported cities",
          type: "error"
        })
        // Fallback cities if API fails
        setCities(["New York", "London", "Paris", "Tokyo", "Sydney", "Los Angeles", "Dubai", "Singapore"])
      } finally {
        setLoadingCities(false)
      }
    }

    loadCities()
  }, [toast])

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

    if (!departureDate) {
      toast({
        title: "Error",
        description: "Please select a departure date",
        type: "error"
      })
      return
    }

    const numPassengers = parseInt(passengers)
    if (isNaN(numPassengers) || numPassengers < 1 || numPassengers > 9) {
      toast({
        title: "Error",
        description: "Please enter a valid number of passengers (1-9)",
        type: "error"
      })
      return
    }

    setIsLoading(true)

    try {
      const flights = await apiService.searchFlights({
        fromCity,
        toCity,
      })

      setFlights(flights)

      if (onSearchResults) {
        onSearchResults(flights)
      }

      if (flights.length === 0) {
        toast({
          title: "No Flights Available",
          description: "No flights found for your search criteria",
          type: "info"
        })
      } else {
        toast({
          title: "Success",
          description: `Found ${flights.length} flights from ${fromCity} to ${toCity}`,
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
    } finally {
      setIsLoading(false)
    }
  }

  const swapCities = () => {
    const temp = fromCity
    setFromCity(toCity)
    setToCity(temp)
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
                {loadingCities ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading cities...</span>
                  </div>
                ) : (
                  <Select value={fromCity} onValueChange={setFromCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="to">To</Label>
                {loadingCities ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading cities...</span>
                  </div>
                ) : (
                  <Select value={toCity} onValueChange={setToCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute -left-12 top-8 md:top-8 p-2"
                  onClick={swapCities}
                  disabled={loadingCities}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Departure Date</Label>
                <Input 
                  id="departure" 
                  type="date" 
                  required 
                  min={new Date().toISOString().split("T")[0]}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="return">Return Date (Optional)</Label>
                <Input 
                  id="return" 
                  type="date" 
                  min={departureDate || new Date().toISOString().split("T")[0]}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passengers
                </Label>
                <Input 
                  id="passengers" 
                  type="number" 
                  min="1" 
                  max="9" 
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading || loadingCities}>
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
          {flights.map((flight) => (
            <Card key={flight.flight.iata} className="p-4">
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
                          onChange={(e) => setBookingForm(prev => ({ ...prev, passengerName: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingForm.passengerEmail}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, passengerEmail: e.target.value }))}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={bookingForm.phoneNumber}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
          ))}
        </div>
      )}
    </div>
  )
}
