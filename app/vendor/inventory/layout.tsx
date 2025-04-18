"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Package, LayoutGrid, BarChart3, FileText } from "lucide-react"

const InventoryLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const tabs = [
    { name: "Products", href: "/vendor/inventory", icon: Package },
    { name: "Categories", href: "/vendor/inventory/categories", icon: LayoutGrid },
    { name: "Stock Analysis", href: "/vendor/inventory/stock-analysis", icon: BarChart3 },
    { name: "Inventory Reports", href: "/vendor/inventory/reports", icon: FileText },
  ]

  const isActive = (href: string) => {
    // Handle index route and sub-routes
    if (href === "/vendor/inventory") {
      return pathname === href
    } 
    return pathname.startsWith(href)
  }

  return (
    <div className="animate-fadeIn bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Inventory Management</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="form-input pl-10 w-full rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">5</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${ 
                  active
                    ? "border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }`}
              >
                <Icon className={`mr-2 h-4 w-4 ${active ? '' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  )
}

export default InventoryLayout 