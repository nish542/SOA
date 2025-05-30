"use client"
import { useState } from "react"
import { Search, Plane, Loader2, Mail } from "lucide-react"
import { apiService, type Booking, type Flight } from "@/lib/api"
import { useToastContext } from "@/components/ui/toast-provider"

export default function BookingsPage() {
  const [searchEmail, setSearchEmail] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToastContext()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const results = await apiService.getBookingsByEmail(searchEmail)
      setBookings(results)
      const flightIds = results.map(booking => booking.flightIata)
      const flights = await apiService.getFlightsByIds(flightIds)
      setFlights(flights)
      
      if (results.length === 0) {
        toast({
          title: "No bookings found",
          description: "No bookings were found for this email address.",
          type: "info",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10 w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>

      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Plane className="text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Flight {booking.flightIata}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.flightDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {booking.passengerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.passengerEmail}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.bookingStatus === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : booking.bookingStatus === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
