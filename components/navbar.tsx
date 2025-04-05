"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, Moon, Sun, Search } from "lucide-react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Check for dark mode preference
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark" || 
       (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDarkMode(true)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white sticky top-0 z-50 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="KirnaMart Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">KirnaMart</span>
          </Link>

          {/* Search Bar - Centered */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <div className={`relative transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-transparent focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600 transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-green-500 text-xs text-white font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {/* Sign In/Sign Up */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/signin"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-full transition-colors duration-300"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-transparent focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600 transition-all"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/signin" 
                className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center"
                onClick={toggleMenu}
              >
                <User className="h-5 w-5 mr-2" />
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded transition-colors"
                onClick={toggleMenu}
              >
                Create Account
              </Link>
              <Link 
                href="/cart" 
                className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center"
                onClick={toggleMenu}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                My Cart
              </Link>
              <Link 
                href="/vendor/dashboard" 
                className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
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

