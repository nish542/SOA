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
      const validFlights = flights.filter((flight: Flight) =>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-white text-center">Search Flights</CardTitle>
            <CardDescription className="text-blue-100 text-center text-lg">Find your perfect journey</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                  <Label htmlFor="from" className="text-gray-700 dark:text-gray-300 text-lg font-medium">From</Label>
                  <Select value={fromCity} onValueChange={setFromCity}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                      <SelectValue placeholder="Select departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_CITIES.map((city) => (
                        <SelectItem key={city} value={city} className="text-lg">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group relative">
                  <Label htmlFor="to" className="text-gray-700 dark:text-gray-300 text-lg font-medium">To</Label>
                  <Select value={toCity} onValueChange={setToCity}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_CITIES.map((city) => (
                        <SelectItem key={city} value={city} className="text-lg">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -left-12 top-10 md:top-10 p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-all duration-200"
                    onClick={swapCities}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-lg h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Flights
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {flights.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Available Flights
            </h2>
            <div className="grid gap-6">
              {flights.map((flight, index) => (
                flight && flight.flight && flight.airline && flight.aircraft && flight.departure && flight.arrival ? (
                <Card key={flight.flight.iata || index} className="p-6 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none group">
                  <div className="flex items-center justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl">
                          <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {flight.airline.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">Flight {flight.flight.number} • {flight.aircraft.iata}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Plane className="h-4 w-4" />
                            <span className="text-sm font-medium">From</span>
                          </div>
                          <p className="text-xl font-semibold text-gray-800 dark:text-white">{flight.departure.airport}</p>
                          <p className="text-lg text-muted-foreground">{formatTime(flight.departure.scheduled)}</p>
                          <p className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full inline-block">
                            Terminal {flight.departure.terminal}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Plane className="h-4 w-4" />
                            <span className="text-sm font-medium">To</span>
                          </div>
                          <p className="text-xl font-semibold text-gray-800 dark:text-white">{flight.arrival.airport}</p>
                          <p className="text-lg text-muted-foreground">{formatTime(flight.arrival.scheduled)}</p>
                          <p className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full inline-block">
                            Terminal {flight.arrival.terminal}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Duration: {calculateFlightDuration(flight.departure.scheduled, flight.arrival.scheduled)}
                        </span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedFlight(flight)}
                          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-lg px-6 py-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          Book Flight
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-gray-800 border-none shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">Book Flight</DialogTitle>
                          <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
                            Enter passenger details to complete your booking
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                          <div className="space-y-3">
                            <Label htmlFor="name" className="text-lg text-gray-700 dark:text-gray-300">Full Name</Label>
                            <Input
                              id="name"
                              value={bookingForm.passengerName}
                              onChange={(e) => handleInputChange(e, 'passengerName')}
                              placeholder="Enter your full name"
                              className="h-12 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-lg text-gray-700 dark:text-gray-300">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={bookingForm.passengerEmail}
                              onChange={(e) => handleInputChange(e, 'passengerEmail')}
                              placeholder="Enter your email"
                              className="h-12 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-lg text-gray-700 dark:text-gray-300">Phone Number</Label>
                            <Input
                              id="phone"
                              value={bookingForm.phoneNumber}
                              onChange={(e) => handleInputChange(e, 'phoneNumber')}
                              placeholder="Enter your phone number"
                              className="h-12 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            onClick={handleBooking}
                            disabled={isBooking || !bookingForm.passengerName || !bookingForm.passengerEmail || !bookingForm.phoneNumber}
                          >
                            {isBooking ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
          </div>
        )}
      </div>
    </div>
  )
}
