import type React from "react"
import "../styles/globals.css"
import { BottomNav } from "@/components/bottom-nav"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}

