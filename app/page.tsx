import { FlightSearch } from '@/components/flight-search';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-light dark:bg-gray-900 text-black dark:text-white flex flex-col items-center justify-center py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
          Book Your Perfect<br />Flight Journey
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Discover the world with our modern flight booking platform. Search,
          compare, and book flights with ease using our microservices-powered
          system.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/search" passHref>
            <Button variant="default" className="px-8 py-3 text-lg flex items-center gap-2">
              Search Flights <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
            </Button>
          </Link>
          <Link href="/bookings" passHref>
            <Button variant="outline" className="px-8 py-3 text-lg flex items-center gap-2">
              View Bookings <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A5.973 5.973 0 0112 12m0 0l6.732 8.874a5.973 5.973 0 01-9.464 0z" /></svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Flight Search Section - Wrapped in Card */}
      <div className="w-full max-w-5xl px-4">
        {/* The FlightSearch component itself likely includes its own Card, but we wrap it here for overall page layout matching the image. */}
        {/* Adjust FlightSearch's internal padding/margin if needed after applying this. */}
        <FlightSearch />
      </div>
    </div>
  );
}
