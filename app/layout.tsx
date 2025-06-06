import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import "./globals.css"
import { Providers } from "@/app/providers"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KirnaMart - Fresh Groceries Delivered",
  description: "A green-themed grocery delivery platform with fresh, organic products.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          {/* <Navbar /> */}
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
