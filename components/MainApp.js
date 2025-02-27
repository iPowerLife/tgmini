"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { supabase } from "../lib/supabase"

export default function MainApp() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === "undefined") return

    const loadData = async () => {
      try {
        // Ждем загрузки Telegram WebApp
        if (!window.Telegram?.WebApp) {
          throw new Error("Telegram WebApp not available")
        }

        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        const initDataUnsafe = tg.initDataUnsafe || {}

        if (!initDataUnsafe.user?.id) {
          throw new Error("No Telegram user ID found")
        }

        const { data, error: supabaseError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", initDataUnsafe.user.id)
          .single()

        if (supabaseError) throw supabaseError
        setUser(data)
      } catch (err) {
        console.error("Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Добавляем небольшую задержку для уверенности, что скрипт Telegram загрузился
    const timer = setTimeout(loadData, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 max-w-md">
          <p className="text-red-500">Ошибка: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Привет, {user?.username}! 👋</h1>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Баланс:</span>
                <span>{user?.balance?.toFixed(2)} 💰</span>
              </div>
              <div className="flex justify-between">
                <span>Мощность:</span>
                <span>{user?.mining_power?.toFixed(2)} ⚡</span>
              </div>
              <div className="flex justify-between">
                <span>Уровень:</span>
                <span>{user?.level || 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

