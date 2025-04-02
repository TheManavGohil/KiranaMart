"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Package, ShoppingCart, Settings, Truck, LogOut } from "lucide-react"

const VendorSidebar = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const menuItems = [
    { href: "/vendor/dashboard", icon: BarChart2, label: "Dashboard" },
    { href: "/vendor/products", icon: Package, label: "Products" },
    { href: "/vendor/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/vendor/inventory", icon: Truck, label: "Inventory" },
    { href: "/vendor/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-600">Vendor Portal</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link href={item.href} className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center text-red-500 hover:text-red-600 p-2 rounded-md transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Link>
      </div>
    </div>
  )
}

export default VendorSidebar

