import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Teateret - Forestillinger og Opptak",
  description: "Opplev teatermagien - kjøp billetter til forestillinger eller se opptak hjemmefra",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nb">
      <body className={`${inter.className} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
