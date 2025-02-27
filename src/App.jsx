"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [log, setLog] = useState([])
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Функция для добавления логов
  const addLog = useCallback((message) => {
    console.log(message)
    setLog((prev) => [...prev, message])
  }, [])

  // Инициализация приложения
  useEffect(() => {
    async function init() {
      try {
        addLog("App mounted")

        // Инициализация Telegram WebApp
        const tg = window.Telegram?.WebApp
        addLog(`Telegram WebApp: ${tg ? "Available" : "Not available"}`)

        if (!tg) throw new Error("Telegram WebApp not available")

        const telegramUser = tg.initDataUnsafe?.user
        addLog(`User data: ${JSON.stringify(telegramUser)}`)

        if (!telegramUser) throw new Error("No user data")

        // Получаем данные пользователя из Supabase
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        // Если пользователя нет, создаем его
        if (!userData) {
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
              },
            ])
            .select()
            .single()

          if (createError) throw createError
          setUser(newUser)
          addLog("New user created")
        } else {
          setUser(userData)
          addLog("Existing user loaded")
        }

        tg.ready()
        tg.expand()
        addLog("Telegram WebApp initialized")
      } catch (error) {
        addLog(`Error: ${error.message}`)
      }
    }

    init()
  }, [addLog])

  // Функция майнинга
  const handleMining = async () => {
    if (isMining || cooldown > 0 || !user) return

    try {
      setIsMining(true)
      addLog("Mining started")

      // Обновляем баланс пользователя
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
      addLog(`Mined ${user.mining_power} coins`)

      // Устанавливаем кулдаун
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
    } catch (error) {
      addLog(`Mining error: ${error.message}`)
    } finally {
      setIsMining(false)
    }
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
        gap: "20px",
      }}
    >
      <h1>Telegram Mining Game</h1>

      {/* Статус */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
        }}
      >
        <div>Статус: Приложение загружено</div>
        <div>Время: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Информация о пользователе */}
      {user && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
          }}
        >
          <div>Баланс: {user.balance.toFixed(2)} 💎</div>
          <div>Мощность: {user.mining_power.toFixed(1)} ⚡</div>
          <div>Уровень: {user.level} ✨</div>
        </div>
      )}

      {/* Кнопка майнинга */}
      <button
        onClick={handleMining}
        disabled={isMining || cooldown > 0}
        style={{
          padding: "15px",
          backgroundColor: isMining || cooldown > 0 ? "#1f2937" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isMining || cooldown > 0 ? "not-allowed" : "pointer",
          fontSize: "16px",
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

      {/* Логи */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          maxHeight: "200px",
          overflow: "auto",
        }}
      >
        {log.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  )
}

