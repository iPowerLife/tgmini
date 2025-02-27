"use client"

import { useState, useEffect } from "react"
import { useWebApp } from "@twa-dev/sdk/react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const webapp = useWebApp()

  useEffect(() => {
    initUser()
  }, [])

  const initUser = async () => {
    try {
      console.log("Initializing user...")
      // Simple test page to verify connection
      const { data, error } = await supabase.from("users").select("count(*)", { count: "exact" })

      if (error) throw error

      console.log("Database connection successful:", data)
      setLoading(false)
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Mining Game</h1>
      <div className="bg-gray-800 rounded-lg p-4">
        <p>Приложение успешно подключено к базе данных!</p>
      </div>
    </div>
  )
}

