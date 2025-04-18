'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image' // For logo
import { MapPin, Phone, Moon, Sun, Search, Menu, X, Store, User, ShoppingCart } from 'lucide-react' // Icons
import { usePathname } from 'next/navigation' // To highlight active link

// TODO: Add Dark Mode state and toggle function (potentially from context)
// TODO: Add Location selection logic
// TODO: Add Search logic

export default function MainNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Placeholder for dark mode state - replace with actual state management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/sell", label: "Sell on KiranaMart" }, // Assuming '/sell' is the route
  ];

  return (
    <header className="bg-white text-gray-800 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gray-100 text-xs text-gray-600 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8">
          <div className="flex items-center space-x-4">
            <button className="flex items-center hover:text-green-600">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <span>Deliver to: Select location</span>
              {/* Add dropdown icon */}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/customer-service" className="flex items-center hover:text-green-600">
              <Phone className="w-3.5 h-3.5 mr-1" />
              <span>Customer Service</span>
            </Link>
            <button onClick={toggleDarkMode} className="flex items-center hover:text-green-600">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 mr-1" /> : <Moon className="w-3.5 h-3.5 mr-1" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="bg-gradient-to-b from-green-50 via-green-100 to-emerald-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              {/* Replace with actual Image component if you have a logo file */}
              <Image src="/kiranmartlogo.png" alt="KiranaMart Logo" width={40} height={40} className="mr-2" />
              <div>
                <span className="text-xl font-bold text-green-700">KiranaMart</span>
                <p className="text-xs text-gray-500">Fresh Groceries Delivered</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-grow max-w-xl mx-4 order-3 md:order-2 w-full md:w-auto">
              <form className="flex">
                <input
                  type="search"
                  placeholder="Search for fruits, vegetables, dairy and more..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-md flex items-center text-sm font-medium">
                  <Search className="w-4 h-4 mr-1 md:hidden" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </form>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-3 order-2 md:order-3">
              <Link href="/vendor" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium">
                <Store className="w-4 h-4 mr-1" />
                <span>Vendor Portal</span>
              </Link>
              {/* Add Login/Signup or User Profile Button Here */}
              {/* Example: User not logged in */}
               <Link href="/auth/login" className="hidden lg:flex items-center text-sm text-gray-600 hover:text-green-600">
                   <User className="w-5 h-5 mr-1" />
                   <span>Login/Signup</span>
               </Link>
               {/* Example: Cart Icon */}
               <Link href="/cart" className="hidden lg:flex items-center text-sm text-gray-600 hover:text-green-600">
                 <ShoppingCart className="w-5 h-5 mr-1" />
                 <span>Cart</span>
               </Link>

               {/* Mobile Menu Toggle */}
               <button
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
               >
                 <span className="sr-only">Open main menu</span>
                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </button>
            </div>

          </div>

           {/* Bottom Navigation Links */}
           <nav className="hidden lg:flex items-center justify-center mt-3 space-x-4">
             {navLinks.map((link) => (
               <Link
                 key={link.href}
                 href={link.href}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                   pathname === link.href
                     ? 'bg-green-600 text-white'
                     : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                 }`}
               >
                 {link.label}
               </Link>
             ))}
           </nav>

        </div>
      </div>

       {/* Mobile Menu Panel */}
       {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
               <Link
                 key={link.href}
                 href={link.href}
                 onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                 className={`block px-3 py-2 rounded-md text-base font-medium ${
                   pathname === link.href
                     ? 'bg-green-100 text-green-700'
                     : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                 }`}
               >
                 {link.label}
               </Link>
            ))}

            {/* Add other mobile links like Login/Cart here if needed */}
             <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
               Login / Signup
             </Link>
             <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
               Cart
             </Link>
          </div>
        </div>
      )}

    </header>
  )
}