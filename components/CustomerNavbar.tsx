'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  User, 
  Search, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  Package,
  Heart,
  Settings,
  MapPin,
  Home,
  Sun,
  Moon,
  Store,
  ShoppingBag
} from "lucide-react";
import { isAuthenticated, getUser, logout } from "@/lib/auth";

type User = {
  name: string;
  email: string;
  role: string;
  _id: string;
}

export default function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Refs for click-outside detection
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null); // Optional: for mobile menu

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Order Shipped",
      message: "Your order #12345 has been shipped and will arrive in 2 days.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Price Drop Alert",
      message: "Price drop on 5 items in your wishlist!",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "New Offer",
      message: "Special weekend offer: 20% off on all dairy products.",
      time: "1 day ago",
      read: true,
    },
  ];

  // Navigation links
  const navLinks = [
    { href: '/customer/dashboard', text: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/customer/products', text: 'Products', icon: <Package className="h-5 w-5" /> },
    { href: '/customer/orders', text: 'Orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { href: '/customer/profile', text: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = isAuthenticated();
        setIsAuth(authStatus);
        
        if (authStatus) {
          const userData = getUser();
          setUser(userData);
        } else {
          router.push('/auth?type=login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
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
  }, [router]);

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

  const handleLogout = () => {
    logout();
    router.push('/auth?type=login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/customer/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const closeAllDropdowns = () => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Effect for handling clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications if click is outside its ref
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      // Close profile if click is outside its ref
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      // Optional: Close mobile menu on outside click too
      // if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
      //   setIsMobileMenuOpen(false);
      // }
    };

    // Add listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Remove listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array ensures this runs only once

  if (isLoading) {
    return (
      <div className="h-16 w-full flex items-center justify-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="animate-pulse h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/customer" className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.png"
                  alt="KiranaMart Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-500">KiranaMart</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:ml-6 md:flex md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.href
                    ? "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.text}
              </Link>
            ))}
          </nav>

          {/* Search (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full py-1.5 pl-10 pr-4 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-200 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right side nav items */}
          <div className="flex items-center space-x-4">
            {/* Delivery Location */}
            <div className="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-green-600 dark:text-green-500 mr-1" />
              <span className="truncate max-w-[120px]">Mumbai, 400001</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark/light mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <Link
              href="/customer/cart-v2"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Notifications Button */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                aria-label="View notifications"
              >
                <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                {hasNewNotifications && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications
                    </h3>
                    <button 
                      className="text-xs text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400"
                      onClick={() => {
                        setHasNewNotifications(false);
                        closeAllDropdowns();
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                            !notification.read ? 'bg-green-50 dark:bg-green-900/10' : ''
                          }`}
                          onClick={() => closeAllDropdowns()}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/customer/notifications"
                      className="text-xs text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400 block text-center"
                      onClick={closeAllDropdowns}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                aria-label="User profile"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <ChevronDown className="h-4 w-4 ml-1 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </div>
                  </div>
                  
                  <Link
                    href="/customer/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => closeAllDropdowns()}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/customer/orders"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => closeAllDropdowns()}
                  >
                    Your Orders
                  </Link>
                  <Link
                    href="/customer/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => closeAllDropdowns()}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      handleLogout();
                      closeAllDropdowns();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full rounded-full py-1.5 pl-10 pr-4 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-200 text-sm shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </form>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="bg-white dark:bg-gray-900 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}

              {/* Add Dark Mode toggle for mobile menu */}
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-500 mr-2" />
                <span>Deliver to: Mumbai, 400001</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/customer/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="/customer/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 