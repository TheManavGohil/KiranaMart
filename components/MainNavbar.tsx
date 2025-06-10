'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  MapPin,
  Sun,
  Moon,
  Store
} from "lucide-react";
import { isAuthenticated, getUserRole } from "@/lib/auth";

export default function MainNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Popular locations for location selector
  const popularLocations = [
    { name: "Mumbai", pincode: "400001" },
    { name: "Delhi", pincode: "110001" },
    { name: "Bangalore", pincode: "560001" },
    { name: "Hyderabad", pincode: "500001" },
    { name: "Chennai", pincode: "600001" },
    { name: "Kolkata", pincode: "700001" },
  ];

  // Main navigation links
  const mainNavLinks = [
    { name: "Home", href: "/", current: pathname === "/" },
    { name: "Products", href: "/products", current: pathname === "/products" },
    { name: "About", href: "/about", current: pathname === "/about" },
    { name: "Contact", href: "/contact", current: pathname === "/contact" },
  ];

  useEffect(() => {
    // Check dark mode preference
    if (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Check auth status
    try {
      const auth = isAuthenticated();
      setIsAuth(auth);
      if (auth) {
        setUserRole(getUserRole());
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log("Searching for:", searchQuery);
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <header className="bg-gradient-to-r from-green-50 to-green-100 dark:from-[#1a2433] dark:to-[#1a2433] border-b border-green-200 dark:border-gray-700 sticky top-0 z-50">
      {/* Top Bar (Location, Customer Service) */}
      <div className="hidden sm:block border-b border-green-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a2433]/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
              >
                <MapPin className="h-4 w-4" />
                <span>Deliver to:</span>
                <span className="font-medium">Select location</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>

              {/* Location Dropdown */}
              {isLocationOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a location
                    </h3>
                  </div>
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      POPULAR CITIES
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {popularLocations.map((location) => (
                        <button
                          key={location.pincode}
                          className="text-left text-sm py-1 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                          onClick={() => {
                            console.log(`Selected location: ${location.name}`);
                            setIsLocationOpen(false);
                          }}
                        >
                          {location.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/support" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                Customer Service
              </Link>
              <button
                onClick={toggleDarkMode}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 mr-1" />
                    <span className="text-xs">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-1" />
                    <span className="text-xs">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="KiranaMart Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600 dark:text-green-400">KiranaMart</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">Fresh Groceries Delivered</span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:block flex-grow max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className={`transition-all duration-300 ${isSearchFocused ? "scale-[1.02]" : ""}`}>
                <input
                  type="text"
                  placeholder="Search for fruits, vegetables, dairy and more..."
                  className="w-full bg-white dark:bg-gray-800 rounded-full py-2.5 px-4 pl-12 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-r-full text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {isAuth ? (
              <>
                {userRole === "customer" ? (
                  <Link
                    href="/customer"
                    className="hidden md:flex items-center px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link
                    href="/vendor/dashboard"
                    className="hidden md:flex items-center px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Store className="h-5 w-5 mr-2" />
                    <span>Vendor Portal</span>
                  </Link>
                )}

                {userRole === "customer" && (
                  <Link
                  href="/customer/cart-v2"
                  className="relative p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth?type=login"
                  className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?type=register"
                  className="hidden sm:inline-flex items-center px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex mt-4 space-x-6">
          {mainNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                link.current
                  ? "bg-green-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/vendor/register"
            className="text-sm font-medium px-3 py-2 rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
          >
            Sell on KiranaMart
          </Link>
        </div>
      </div>

      {/* Mobile Search (shown below navbar) */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full bg-white dark:bg-gray-800 rounded-full py-2 px-4 pl-10 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  link.current
                    ? "bg-green-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/vendor/register"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Sell on KiranaMart
            </Link>
          </div>

          {/* Mobile bottom menu items */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 space-y-1">
              {isAuth ? (
                <>
                  <Link
                    href={userRole === "vendor" ? "/vendor/dashboard" : "/customer"}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {userRole === "vendor" ? "Vendor Dashboard" : "My Account"}
                  </Link>
                  {userRole === "customer" && (
                    <Link
                    href="/customer/cart-v2"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/auth?type=login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth?type=register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5 mr-2" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 mr-2" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <Link
                href="/support"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Customer Service
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 