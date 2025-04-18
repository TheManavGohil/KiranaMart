'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart2, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings, 
  User, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  Store,
  Sun,
  Moon
} from "lucide-react";
import { isAuthenticated, getUser, getUserRole, logout } from "@/lib/auth";

export default function VendorNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Refs for click-outside detection
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Mock notifications for UI
  const notifications = [
    {
      id: 1,
      title: "New Order #12345",
      message: "You have received a new order for ₹599",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Low Inventory Alert",
      message: "Your product 'Organic Apples' is running low on stock",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of ₹1,250 has been credited to your account",
      time: "Yesterday",
      read: true,
    },
  ];

  // Nav links that appear on desktop
  const mainNavLinks = [
    { 
      name: "Dashboard", 
      href: "/vendor/dashboard", 
      icon: BarChart2 
    },
    { 
      name: "Inventory", 
      href: "/vendor/inventory", 
      icon: Package 
    },
    { 
      name: "Orders", 
      href: "/vendor/orders", 
      icon: ShoppingBag 
    },
    { 
      name: "Delivery", 
      href: "/vendor/delivery", 
      icon: Truck 
    },
  ];

  useEffect(() => {
    // Check dark mode preference
    if (localStorage.getItem("theme") === "dark" || 
       (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
    
    // Check auth status
    try {
      const auth = isAuthenticated();
      setIsAuth(auth);
      if (auth) {
        const userData = getUser();
        const role = getUserRole();
        
        if (role !== 'vendor') {
          // Redirect if not a vendor
          router.push('/auth');
          return;
        }
        
        setUser(userData);
      } else {
        // Redirect if not authenticated
        router.push('/auth');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Redirect on error
      router.push('/auth');
      return;
    } finally {
      setIsLoading(false);
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
    router.push('/auth');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to vendor orders page with search query
    router.push(`/vendor/orders?search=${encodeURIComponent(searchQuery)}`);
    console.log("Vendor Searching for:", searchQuery);
  };

  // Function to close dropdowns (can be reused)
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
    };

    // Add listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Remove listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/vendor/dashboard" className="flex items-center space-x-2">
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
                <span className="text-lg font-bold text-green-600 dark:text-green-400">KiranaMart</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Vendor Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {mainNavLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400" 
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} mr-1.5`} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-grow max-w-xs mx-4">
            <form onSubmit={handleSearch} className="relative text-gray-600 dark:text-gray-300">
              <input
                type="search"
                name="search"
                placeholder="Search orders, products..."
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="relative p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => {
                   setIsNotificationsOpen(!isNotificationsOpen);
                   setIsProfileOpen(false);
                }}
                aria-label="View notifications"
              >
                <Bell className="h-6 w-6" />
                {hasNewNotifications && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-2 ${
                            notification.read ? "border-transparent" : "border-green-500"
                          }`}
                        >
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/vendor/notifications"
                      className="text-xs text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 block text-center"
                      onClick={closeAllDropdowns}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center space-x-2 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => {
                   setIsProfileOpen(!isProfileOpen);
                   setIsNotificationsOpen(false);
                }}
                aria-label="User profile"
              >
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  {user?.name ? user.name[0].toUpperCase() : <User className="h-5 w-5" />}
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{user?.name || "Vendor"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email || "vendor@example.com"}</p>
                  </div>
                  <Link
                    href="/vendor/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={closeAllDropdowns}
                  >
                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/vendor/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={closeAllDropdowns}
                  >
                    <Settings className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Store Settings
                  </Link>
                  <Link
                    href="/vendor/storefront"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={closeAllDropdowns}
                  >
                    <Store className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    View Storefront
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" ref={mobileMenuRef}>
          {/* Mobile Search */}
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative text-gray-600 dark:text-gray-300">
              <input
                type="search"
                name="search"
                placeholder="Search orders, products..."
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Mobile Navigation Links */}
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} mr-2`} />
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5 text-yellow-500 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
              <Link
                href="/vendor/profile"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                My Profile
              </Link>
              <Link
                href="/vendor/settings"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                Store Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 