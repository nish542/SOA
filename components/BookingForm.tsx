'use client';

import { useState } from 'react';
import { apiService, type Flight } from '@/lib/api';
import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';

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

  const inputClassName = "mt-1 block w-full p-3 border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium";
  const labelClassName = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-sm">
        <div className="space-y-1">
          <label className={labelClassName}>
            Passenger Name
          </label>
          <input
            type="text"
            required
            value={formData.passengerName}
            onChange={(e) => setFormData(prev => ({ ...prev, passengerName: e.target.value }))}
            className={inputClassName}
            placeholder="Enter passenger name"
          />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.passengerEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, passengerEmail: e.target.value }))}
            className={inputClassName}
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>
            Seat Number
          </label>
          <input
            type="text"
            required
            value={formData.seatNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, seatNumber: e.target.value }))}
            className={inputClassName}
            placeholder="Enter seat number"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Book Flight</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}