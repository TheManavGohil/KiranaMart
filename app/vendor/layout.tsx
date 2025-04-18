'use client'

import type React from "react"
import VendorSidebar from "@/components/vendor-sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserRole } from '@/lib/auth'
<<<<<<< HEAD
import VendorNavbar from '@/components/VendorNavbar'
=======
>>>>>>> 66ceb69eb1008533e49732dd38fc6c408b707123

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const userRole = getUserRole()

      if (!authenticated || userRole !== 'vendor') {
        router.replace('/auth')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
<<<<<<< HEAD
      <VendorNavbar />
=======
>>>>>>> 66ceb69eb1008533e49732dd38fc6c408b707123
      <VendorSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto pt-4 md:pt-8">{children}</div>
    </div>
  )
}

