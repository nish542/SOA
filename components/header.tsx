"use client"

import { Plane } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FlightBook</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/bookings"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/bookings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            My Bookings
          </Link>
          <Link
            href="/search"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/search" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Search Flights
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
