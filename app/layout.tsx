import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "LensConnect - Connect with Professional Photographers",
  description: "Book professional photographers for events, portraits, products, and real estate",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans font-mono">
        
        {children}
        
        <Analytics />
      </body>
    </html>
  )
}
