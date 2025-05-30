'use client';

import { useState } from 'react';
import { apiService, type Flight } from '@/lib/api';

interface BookingFormProps {
  flight: Flight;
  onSuccess?: () => void;
}

export default function BookingForm({ flight, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerEmail: '',
    seatNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createBooking({
        flightIata: flight.flight.iata,
        passengerName: formData.passengerName,
        passengerEmail: formData.passengerEmail,
        phoneNumber: formData.seatNumber,
        airlineName: flight.airline.name,
        departureAirport: flight.departure.iata,
        arrivalAirport: flight.arrival.iata,
        departureTerminal: flight.departure.terminal,
        arrivalTerminal: flight.arrival.terminal,
        flightDate: flight.flight_date,
        aircraftIata: flight.aircraft.iata
      });
      onSuccess?.();
      setFormData({
        passengerName: '',
        passengerEmail: '',
        seatNumber: ''
      });
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Passenger Name
        </label>
        <input
          type="text"
          required
          value={formData.passengerName}
          onChange={(e) => setFormData(prev => ({ ...prev, passengerName: e.target.value }))}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          required
          value={formData.passengerEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, passengerEmail: e.target.value }))}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Seat Number
        </label>
        <input
          type="text"
          required
          value={formData.seatNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, seatNumber: e.target.value }))}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-green-300"
      >
        {loading ? 'Processing...' : 'Book Flight'}
      </button>
    </form>
  );
} 