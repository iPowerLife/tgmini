"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [status, setStatus] = useState("loading")
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    async function initializeApp() {
      try {
        // Инициализация Telegram WebApp
        const tg = window.Telegram?.WebApp
        if (!tg) {
          throw new Error("Telegram WebApp не доступен")
        }

        // Получаем данные пользователя
        const telegramUser = tg.initDataUnsafe?.user
        if (!telegramUser) {
          throw new Error("Не удалось получить данные пользователя")
        }

        // Получаем или создаем пользователя в базе данных
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        if (!existingUser) {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                balance: 0,
                mining_power: 1,
                level: 1,
                experience: 0,
                next_level_exp: 100,
                last_mining: new Date().toISOString(),
              },
            ])
            .select()
            .single()

          if (createError) throw createError
          setUser(newUser)
        } else {
          setUser(existingUser)
        }

        // Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()

        setStatus("ready")
      } catch (err) {
        console.error("Initialization error:", err)
        setError(err.message)
        setStatus("error")
      }
    }

    initializeApp()
  }, [])

  const handleMining = async () => {
    if (isMining || cooldown > 0 || !user) return

    try {
      setIsMining(true)

      const { data, error } = await supabase
        .from("users")
        .update({
          balance: user.balance + user.mining_power,
          last_mining: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      setCooldown(60)

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      console.error("Mining error:", err)
      setError(err.message)
    } finally {
      setIsMining(false)
    }
  }

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1b1e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>Загрузка приложения...</div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1b1e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ff4444", marginBottom: "20px" }}>Ошибка: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
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
        backgroundColor: "#1a1b1e",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Telegram Mining Game</h1>

      {user && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>Баланс: {user.balance.toFixed(2)} 💎</div>
          <div style={{ marginBottom: "10px" }}>Мощность: {user.mining_power.toFixed(1)} ⚡</div>
          <div>Уровень: {user.level} ✨</div>
        </div>
      )}

      <button
        onClick={handleMining}
        disabled={isMining || cooldown > 0}
        style={{
          padding: "20px",
          backgroundColor: isMining || cooldown > 0 ? "#1f2937" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: isMining || cooldown > 0 ? "not-allowed" : "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isMining ? "Майнинг..." : cooldown > 0 ? `Перезарядка (${cooldown}с)` : "Начать майнинг ⛏️"}

        {cooldown > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "4px",
              backgroundColor: "#3b82f6",
              width: `${(cooldown / 60) * 100}%`,
              transition: "width 1s linear",
            }}
          />
        )}
      </button>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "rgba(255, 68, 68, 0.1)",
            borderRadius: "8px",
            color: "#ff4444",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

