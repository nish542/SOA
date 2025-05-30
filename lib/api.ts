import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export interface FlightSearchRequest {
  fromCity: string;
  toCity: string;
}

export interface BookingRequest {
  passengerName: string;
  passengerEmail: string;
  phoneNumber: string;
  flightIata: string;
  airlineName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  flightDate: string;
  aircraftIata: string;
}

export interface Flight {
  aircraft: {
    iata: string;
    icao: string;
    registration: string;
  };
  airline: {
    iata: string;
    icao: string;
    name: string;
  };
  arrival: {
    airport: string;
    iata: string;
    icao: string;
    scheduled: string;
    terminal?: string;
    gate?: string;
  };
  departure: {
    airport: string;
    iata: string;
    icao: string;
    scheduled: string;
    terminal?: string;
    gate?: string;
  };
  flight: {
    iata: string;
    icao: string;
    number: string;
  };
  flight_date: string;
  flight_status: string;
}

export interface Booking {
  id: string;
  flightIata: string;
  passengerName: string;
  passengerEmail: string;
  phoneNumber: string;
  airlineName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  flightDate: string;
  aircraftIata?: string;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  flights?: T;
  booking?: T;
  bookings?: T;
  cities?: T;
}

export interface SearchFlightsParams {
  origin: string;
  destination: string;
  date: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async searchFlights(params: { fromCity: string; toCity: string }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/flights/search`, {
        fromCity: params.fromCity,
        toCity: params.toCity
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search flights');
      }
      
      return response.data.flights || [];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async createBooking(booking: BookingRequest) {
    const response = await axios.post(`${API_BASE_URL}/bookings`, booking);
    return response.data;
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      //dummy - GET /api/bookings endpoint
      const response = await this.request<ApiResponse<Booking[]>>('/bookings');

      if (response.success && response.bookings) {
        return response.bookings;
      }
      throw new Error(response.message || 'Failed to get bookings');
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  async getBookingDetails(bookingId: string) {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
    return response.data;
  }

  async getBookingsByEmail(email: string): Promise<Booking[]> {
    try {
      //dummy - GET /api/bookings/email/{email} endpoint
      const response = await this.request<ApiResponse<Booking[]>>(`/bookings/email/${encodeURIComponent(email)}`);

      if (response.success && response.bookings) {
        return response.bookings;
      }
      throw new Error(response.message || 'Failed to get bookings');
    } catch (error) {
      console.error('Error getting bookings by email:', error);
      throw error;
    }
  }

  async getSupportedCities(): Promise<string[]> {
    try {
      //dummy - GET /api/cities endpoint
      const response = await this.request<ApiResponse<string[]>>('/cities');

      if (response.success && response.cities) {
        return response.cities;
      }
      throw new Error(response.message || 'Failed to get cities');
    } catch (error) {
      console.error('Error getting cities:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
