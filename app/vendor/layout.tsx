import type React from "react"
import VendorSidebar from "@/components/vendor-sidebar"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}

