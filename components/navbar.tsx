"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X, User } from "lucide-react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-green-500 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="KirnaMart Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold">KirnaMart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="hover:text-green-200 transition duration-200">
              Products
            </Link>
            <Link href="/support" className="hover:text-green-200 transition duration-200">
              Support
            </Link>
            <Link href="/vendor/dashboard" className="hover:text-green-200 transition duration-200">
              Vendor Portal
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>

          {/* Icons - Cart & Profile */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-1 hover:bg-green-600 rounded-full transition">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-green-800 font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link href="/profile" className="p-1 hover:bg-green-600 rounded-full transition hidden md:block">
              <User className="h-6 w-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-1 hover:bg-green-600 rounded-full transition focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full rounded-full py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-2 pt-2 border-t border-green-400">
            <div className="flex flex-col space-y-3">
              <Link href="/products" className="hover:bg-green-600 px-3 py-2 rounded transition" onClick={toggleMenu}>
                Products
              </Link>
              <Link href="/profile" className="hover:bg-green-600 px-3 py-2 rounded transition" onClick={toggleMenu}>
                My Profile
              </Link>
              <Link href="/orders" className="hover:bg-green-600 px-3 py-2 rounded transition" onClick={toggleMenu}>
                My Orders
              </Link>
              <Link href="/support" className="hover:bg-green-600 px-3 py-2 rounded transition" onClick={toggleMenu}>
                Support
              </Link>
              <Link
                href="/vendor/dashboard"
                className="hover:bg-green-600 px-3 py-2 rounded transition"
                onClick={toggleMenu}
              >
                Vendor Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

