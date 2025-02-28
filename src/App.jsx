"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram } from "./utils/telegram"
import { LoadingScreen } from "./components/LoadingScreen"

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("🔄 Initializing application...")

        // Инициализируем Telegram WebApp
        const tg = initTelegram()
        if (!tg) {
          console.warn("⚠️ Telegram WebApp not available, continuing in dev mode...")
        }

        // Проверяем подключение к Supabase
        const { data, error } = await supabase.from("users").select("count").single()
        if (error) throw error

        console.log("✅ Application initialized successfully")
        setIsInitialized(true)
      } catch (err) {
        console.error("❌ Initialization error:", err)
        setError(err.message)
      }
    }

    initialize()
  }, [])

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1b1e",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ef4444", marginBottom: "20px" }}>Ошибка инициализации</div>
        <div style={{ color: "#666" }}>{error}</div>
      </div>
    )
  }

  if (!isInitialized) {
    return <LoadingScreen message="Подключение к серверу..." />
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Подключение установлено!</h1>
        <p>Если вы видите это сообщение, значит приложение работает корректно.</p>
      </div>
    </div>
  )
}

