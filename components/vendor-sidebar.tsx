"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Package, ShoppingCart, Settings, Truck, LogOut, Navigation, LineChart, Menu, X, Sun, Moon } from "lucide-react"

const VendorSidebar = () => {
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for dark mode preference
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark" || 
       (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }
  }, [])

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

  const isActive = (path: string) => {
    // Handle potential trailing slashes or exact matches
    return pathname === path || pathname.startsWith(path + '/')
  }

  const menuItems = [
    { href: "/vendor/dashboard", icon: BarChart2, label: "Dashboard" },
    { href: "/vendor/products", icon: Package, label: "Products" },
    { href: "/vendor/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/vendor/delivery", icon: Navigation, label: "Delivery" },
    { href: "/vendor/analytics", icon: LineChart, label: "Analytics" },
    { href: "/vendor/inventory", icon: Truck, label: "Inventory" },
    { href: "/vendor/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-green-600 dark:text-green-400">Vendor Portal</h1>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - Desktop: always visible, Mobile: shown when open */}
      <div 
        className={`fixed md:sticky top-0 z-30 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col md:w-64 transition-all duration-300 ease-in-out overflow-hidden
          ${isMobileSidebarOpen ? 'w-64 left-0' : '-left-64 w-0 md:w-64 md:left-0'}`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Vendor Portal</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center py-2 px-4 rounded-md transition-colors ${
                      isActive(item.href) 
                        ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Dark Mode Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 mr-3 text-yellow-500" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 mr-3" />
                Dark Mode
              </>
            )}
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href="/" 
            className="flex items-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 p-2 rounded-md transition-colors"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Link>
        </div>
      </div>
    </>
  )
}

export default VendorSidebar

