import { Plane } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">FlightBook</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern flight booking platform powered by microservices architecture.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-primary">
                  Flight Search
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-primary">
                  Manage Bookings
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Check-in
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Flight Status
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 FlightBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
