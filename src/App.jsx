"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "./components/LoadingScreen"
import { supabase } from "./supabase"

export default function App() {
  const [status, setStatus] = useState("initializing")
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        // 1. Проверяем Telegram WebApp
        const tg = window.Telegram?.WebApp
        if (!tg) {
          throw new Error("Telegram WebApp не доступен")
        }

        if (!mounted) return
        setStatus("connecting")

        // 2. Получаем данные пользователя
        const telegramUser = tg.initDataUnsafe?.user
        if (!telegramUser) {
          throw new Error("Не удалось получить данные пользователя")
        }

        // 3. Проверяем подключение к базе данных
        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (dbError && dbError.code !== "PGRST116") {
          throw new Error(`Ошибка базы данных: ${dbError.message}`)
        }

        if (!mounted) return

        // 4. Устанавливаем данные пользователя
        setUser(
          userData || {
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            balance: 0,
            mining_power: 1,
          },
        )

        setStatus("ready")

        // 5. Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()
      } catch (err) {
        console.error("Initialization error:", err)
        if (mounted) {
          setError(err.message)
          setStatus("error")
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  // Показываем экран загрузки
  if (status === "initializing" || status === "connecting") {
    return (
      <LoadingScreen
        message={status === "initializing" ? "Загрузка приложения..." : "Подключение к серверу..."}
        subMessage={status === "initializing" ? "Подождите, игра запускается" : "Получение данных пользователя"}
      />
    )
  }

  // Показываем ошибку
  if (status === "error") {
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
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ff4444", marginBottom: "10px" }}>Произошла ошибка</div>
        <div style={{ color: "#666", fontSize: "14px" }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  // Основной интерфейс
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
        onClick={() => {
          // Здесь будет логика майнинга
          console.log("Mining started")
        }}
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

