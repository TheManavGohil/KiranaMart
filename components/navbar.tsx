"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, Moon, Sun, Search, LogOut, Settings, Store } from "lucide-react"
import { isAuthenticated as checkAuth, getUserRole, getUser, logout } from "@/lib/auth"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")

  // Check for dark mode preference and auth status
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark" || 
       (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }

    // Check auth status
    const authStatus = checkAuth()
    setIsAuth(authStatus)
    
    if (authStatus) {
      setUserRole(getUserRole())
      const user = getUser()
      if (user && user.name) {
        setUserName(user.name)
      }
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
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

  const handleLogout = () => {
    logout()
    setIsAuth(false)
    setUserRole(null)
    setUserName("")
    setIsUserMenuOpen(false)
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
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuth ? (
                <>
                  <Link 
                    href="/auth" 
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* Cart link (for customers) */}
                  {userRole === 'customer' && (
                    <Link
                      href="/customer/cart"
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                    </Link>
                  )}
                  
                  {/* Dashboard Link */}
                  <Link
                    href={userRole === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard'}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  {/* User Avatar/Menu */}
                  <div className="relative">
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                        {userName ? userName[0].toUpperCase() : <User className="h-5 w-5" />}
                      </div>
                      <span className="text-sm font-medium hidden lg:inline-block">
                        {userName || "User"}
                      </span>
                    </button>
                    
                    {/* User dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                        {userRole === 'vendor' ? (
                          <Link
                            href="/vendor/settings"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Store Settings
                          </Link>
                        ) : (
                          <Link
                            href="/customer/profile"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            My Profile
                          </Link>
                        )}
                        
                        {userRole === 'vendor' && (
                          <Link
                            href="/vendor/inventory"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Inventory
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pt-3 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-transparent focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {!isAuth ? (
                <>
                  <Link 
                    href="/auth" 
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center"
                    onClick={toggleMenu}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                  <Link 
                    href="/auth" 
                    className="bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded transition-colors"
                    onClick={toggleMenu}
                  >
                    Create Account
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-2">
                        {userName ? userName[0].toUpperCase() : <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{userName || "User"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{userRole === 'vendor' ? 'Store Owner' : 'Customer'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={userRole === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard'} 
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  
                  {userRole === 'customer' && (
                    <Link 
                      href="/customer/cart" 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center"
                      onClick={toggleMenu}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      My Cart
                    </Link>
                  )}
                  
                  {userRole === 'vendor' ? (
                    <>
                      <Link 
                        href="/vendor/inventory" 
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
                        onClick={toggleMenu}
                      >
                        Inventory
                      </Link>
                      <Link 
                        href="/vendor/settings" 
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
                        onClick={toggleMenu}
                      >
                        Store Settings
                      </Link>
                    </>
                  ) : (
                    <Link 
                      href="/customer/profile" 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
                      onClick={toggleMenu}
                    >
                      My Profile
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

