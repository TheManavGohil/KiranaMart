'use client'

import React from 'react'
import Link from 'next/link'
// Import icons if needed, e.g., import { ShoppingCartIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

// TODO: Add logic to get user session/info

export default function CustomerNavbar() {
  const handleLogout = async () => {
    // TODO: Implement logout logic (e.g., call API route)
    console.log("Logout clicked")
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              KiranaMart
            </Link>
            {/* Customer-specific navigation links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/customer/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/customer/orders" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  My Orders
                </Link>
                <Link href="/customer/profile" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                 <Link href="/products" className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                   Shop
                 </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Cart Icon */}
              <Link href="/cart" className="hover:text-blue-200 p-1 rounded-full">
                <span className="sr-only">View cart</span>
                {/* <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" /> */}
                 Cart {/* Placeholder Icon */}
              </Link>

              {/* Profile Icon */}
              <Link href="/customer/profile" className="hover:text-blue-200 p-1 rounded-full">
                <span className="sr-only">View profile</span>
                 {/* <UserCircleIcon className="h-6 w-6" aria-hidden="true" /> */}
                  Profile {/* Placeholder Icon */}
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                {/* <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" aria-hidden="true" /> */}
                Logout
              </button>
            </div>
          </div>
          {/* Mobile menu button (optional) */}
          <div className="-mr-2 flex md:hidden">
            {/* Implement mobile menu toggle here */}
            <button className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {/* Add Hamburger Icon */}
              MENU {/* Placeholder */}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (optional) */}
      {/* Add mobile menu structure similar to MainNavbar if needed */}
    </nav>
  )
} 