"use client"

import { useState, useEffect } from "react"
import { testConnection } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"

export default function App() {
  const [status, setStatus] = useState("Инициализация...")
  const [error, setError] = useState(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        // Шаг 1: Проверяем подключение к Supabase
        setStatus("Подключение к серверу...")
        const isConnected = await testConnection()
        if (!isConnected) {
          throw new Error("Не удалось подключиться к серверу")
        }

        // Шаг 2: Инициализируем Telegram WebApp
        setStatus("Инициализация Telegram...")
        const tg = initTelegram()
        if (!tg) {
          console.warn("⚠️ Telegram WebApp not available, continuing in dev mode")
        }

        // Шаг 3: Получаем данные пользователя
        const user = getTelegramUser()
        console.log("👤 User data:", user)

        setStatus("Приложение загружено!")
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
          backgroundColor: "#1a1b1e",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ef4444", marginBottom: "20px" }}>Ошибка</div>
        <div style={{ color: "#666" }}>{error}</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>{status}</h1>
      <p>Базовая версия приложения</p>
    </div>
  )
}

