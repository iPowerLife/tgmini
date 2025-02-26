"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  showAlert: (message: string) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export default function Home() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initTelegram = () => {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === "development"

      if (typeof window !== "undefined") {
        // In development, create a mock Telegram WebApp object
        if (isDevelopment && !window.Telegram) {
          window.Telegram = {
            WebApp: {
              ready: () => console.log("Mock: Telegram WebApp ready"),
              expand: () => console.log("Mock: Telegram WebApp expanded"),
              showAlert: (message) => alert(message),
            },
          }
        }

        if (window.Telegram?.WebApp) {
          const telegram = window.Telegram.WebApp
          setTg(telegram)
          telegram.ready()
          telegram.expand()
        }
      }
      setIsLoading(false)
    }

    // Wait for Telegram script to load
    setTimeout(initTelegram, 1000)
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Mining Game</h1>
      <div className="grid gap-4">
        <Button variant="outline" className="w-full" onClick={() => tg?.showAlert("Coming soon!")}>
          Start Mining
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="w-full">
            Tasks
          </Button>
          <Button variant="secondary" className="w-full">
            Shop
          </Button>
          <Button variant="secondary" className="w-full">
            Rating
          </Button>
          <Button variant="secondary" className="w-full">
            Profile
          </Button>
        </div>
      </div>
    </div>
  )
}

