'use client';

import { useState } from 'react';
import { apiService, type Flight } from '@/lib/api';

export default function FlightSearch() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const results = await apiService.searchFlights({
        fromCity: searchParams.origin,
        toCity: searchParams.destination
      });
      setFlights(results);
    } catch (err) {
      setError('Failed to search flights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Origin (e.g., JFK)"
            value={searchParams.origin}
            onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Destination (e.g., LAX)"
            value={searchParams.destination}
            onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {flights.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Available Flights</h2>
          <div className="space-y-4">
            {flights.map((flight) => (
              <div key={flight.flight.iata} className="p-4 border rounded shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{flight.airline.name} {flight.flight.number}</h3>
                    <p className="text-gray-600">
                      {flight.departure.airport} → {flight.arrival.airport}
                    </p>
                    <p className="text-sm text-gray-500">
                      Departure: {new Date(flight.departure.scheduled).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Terminal: {flight.departure.terminal}
                    </p>
                    <p className="text-sm text-gray-500">
                      Aircraft: {flight.aircraft.iata}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 