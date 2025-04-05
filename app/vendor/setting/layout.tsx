"use client" // Needed for client-side navigation state

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Settings as SettingsIcon, Store, User, BellRing, Network } from "lucide-react"

// Define navigation items
const settingsNavItems = [
  { name: "Store", href: "/vendor/setting", icon: Store },
  { name: "Profile", href: "/vendor/setting/profile", icon: User },
  { name: "Notifications", href: "/vendor/setting/notifications", icon: BellRing }, // Placeholder links
  { name: "Integrations", href: "/vendor/setting/integrations", icon: Network },   // Placeholder links
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search settings..."
                className="form-input pl-9 pr-3 py-1.5 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              />
            </div>
            {/* Notification Icon */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Bell className="h-5 w-5" />
              {/* Example Notification Badge */}
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        {/* Sub Navigation Tabs */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            Store Settings
          </h2>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href === "/vendor/setting" && pathname.startsWith("/vendor/setting") && !pathname.includes('/profile') && !pathname.includes('/notifications') && !pathname.includes('/integrations') ) || (item.href !== "/vendor/setting" && pathname.startsWith(item.href));
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
                      ${
                        isActive
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'}`} aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
} 