"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function initializeApp() {
      try {
        // Получаем данные пользователя из Telegram
        const tg = window.Telegram?.WebApp
        const telegramUser = tg?.initDataUnsafe?.user

        if (!telegramUser) {
          throw new Error("Не удалось получить данные пользователя Telegram")
        }

        // Проверяем подключение к Supabase
        const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

        if (error && error.code !== "PGRST116") {
          throw new Error(`Ошибка базы данных: ${error.message}`)
        }

        setUser(data || { telegram_id: telegramUser.id })
        setIsLoading(false)
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
        }}
      >
        <div>Загрузка игры...</div>
        <div style={{ color: "#666", fontSize: "14px" }}>Подключение к серверу</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
        }}
      >
        <div style={{ color: "#ff4444" }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Telegram Mining Game</h1>

      {user && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div>ID: {user.telegram_id}</div>
          <div>Баланс: {user.balance || 0} 💎</div>
          <div>Мощность: {user.mining_power || 1} ⚡</div>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "15px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Начать майнинг ⛏️
      </button>
    </div>
  )
}

