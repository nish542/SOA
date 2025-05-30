"use client"

import { useState } from "react"
import { Search, Calendar, User, Plane, Mail, Loader2, Clock, DollarSign } from "lucide-react"
import { apiService, type Flight } from "@/lib/api"
import { useToastContext } from "@/components/ui/toast-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SearchPage() {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: ''
  })
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null)
  const { toast } = useToastContext()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const results = await apiService.searchFlights({
        fromCity: searchParams.origin,
        toCity: searchParams.destination
      })
      setFlights(results)
      setHasSearched(true)
      if (results.length === 0) {
        toast({
          title: "No flights found",
          description: "Please try different search criteria.",
          type: "info"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search flights. Please try again.",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string | undefined | null): string => {
    if (!timeString) return "N/A"
    try {
      if (timeString.includes("T")) {
        const date = new Date(timeString)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      return timeString
    } catch (error) {
      return "N/A"
    }
  }

  const calculateDuration = (departure: string, arrival: string) => {
    try {
      const dep = new Date(departure)
      const arr = new Date(arrival)
      const diff = arr.getTime() - dep.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    } catch (error) {
      return "N/A"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Flights</h1>
        <p className="text-muted-foreground">Find and compare flights from our extensive network</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="origin"
                    value={searchParams.origin}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City or Airport"
                    required
                  />
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="destination"
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City or Airport"
                    required
                  />
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
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

      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {flights.length} Flight{flights.length !== 1 ? "s" : ""} Found
            </h2>
            {flights.length > 0 && (
              <div className="text-sm text-muted-foreground">Sorted by price (lowest first)</div>
            )}
          </div>

          {flights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No flights found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or selecting different cities
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flights.map((flight) => (
                <Card key={flight.flight.iata} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{flight.flight.number}</Badge>
                          <span className="font-medium">{flight.airline.name}</span>
                          <Badge variant="outline">Non-stop</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="text-2xl font-bold">{formatTime(flight.departure.scheduled)}</div>
                            <div className="text-sm text-muted-foreground">{flight.departure.airport}</div>
                          </div>

                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {calculateDuration(flight.departure.scheduled, flight.arrival.scheduled)}
                            </div>
                            <div className="w-full border-t border-dashed"></div>
                            <Plane className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="space-y-1 text-right md:text-left lg:text-right">
                            <div className="text-2xl font-bold">{formatTime(flight.arrival.scheduled)}</div>
                            <div className="text-sm text-muted-foreground">{flight.arrival.airport}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-4 lg:min-w-[200px]">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-2xl font-bold">
                            <DollarSign className="h-5 w-5" />
                            299.99
                          </div>
                          <div className="text-sm text-muted-foreground">per person</div>
                        </div>

                        <Button
                          onClick={() => setSelectedFlight(flight.flight.iata)}
                          className="w-full lg:w-auto"
                          variant={selectedFlight === flight.flight.iata ? "default" : "outline"}
                        >
                          {selectedFlight === flight.flight.iata ? "Selected" : "Select Flight"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Search?</CardTitle>
            <CardDescription>
              Fill in your travel details above and click "Search Flights" to see available options
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
