import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
<<<<<<< HEAD
// import Navbar from "@/components/navbar"
=======
import Navbar from "@/components/navbar"
>>>>>>> 66ceb69eb1008533e49732dd38fc6c408b707123
import Footer from "@/components/footer"
import "./globals.css"
import { Providers } from "@/app/providers"

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
<<<<<<< HEAD
          {/* <Navbar /> */}
=======
          <Navbar />
>>>>>>> 66ceb69eb1008533e49732dd38fc6c408b707123
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
