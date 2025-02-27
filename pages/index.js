"use client"

import { useState, useEffect } from "react"
import Script from "next/script"

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simple initialization check
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <h1 className="text-2xl font-bold mb-4">Mining Game</h1>
      <div className="bg-gray-800 rounded-lg p-4">
        <p>Initial setup complete!</p>
      </div>
    </div>
  )
}

