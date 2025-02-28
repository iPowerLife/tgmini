"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { LoadingScreen } from "./components/LoadingScreen"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [miningPower, setMiningPower] = useState(1)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Инициализация
  useEffect(() => {
    async function init() {
      try {
        // Инициализируем Telegram
        initTelegram()
        const telegramUser = getTelegramUser()

        if (!telegramUser) {
          throw new Error("Не удалось получить данные пользователя Telegram")
        }

        // Получаем или создаем пользователя в базе
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (existingUser) {
          setUser(existingUser)
          setBalance(existingUser.balance)
          setMiningPower(existingUser.mining_power)
        } else {
          const { data: newUser, error } = await supabase
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

          if (error) throw error
          setUser(newUser)
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const mine = useCallback(async () => {
    if (isMining || cooldown > 0 || !user) return

    setIsMining(true)
    const amount = miningPower

    try {
      // Обновляем баланс в базе данных
      const { data, error } = await supabase
        .from("users")
        .update({
          balance: user.balance + amount,
          last_mining: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      // Обновляем локальное состояние
      setBalance((prev) => +(prev + amount).toFixed(2))
      setUser(data)

      // Логируем транзакцию
      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: amount,
          type: "mining",
          description: "Майнинг криптовалюты",
        },
      ])
    } catch (err) {
      console.error("Ошибка майнинга:", err)
    } finally {
      setIsMining(false)
      setCooldown(3)

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [isMining, cooldown, miningPower, user])

  if (isLoading) {
    return <LoadingScreen message="Загрузка игры..." />
  }

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
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "20px", color: "#ef4444" }}>Ошибка</div>
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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
          <span>Баланс:</span>
          <span>{balance.toFixed(2)} 💎</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Мощность:</span>
          <span>{miningPower.toFixed(1)} ⚡</span>
        </div>
      </div>

      <button
        onClick={mine}
        disabled={isMining || cooldown > 0}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          backgroundColor: isMining || cooldown > 0 ? "#1f2937" : "#3b82f6",
          border: "none",
          borderRadius: "12px",
          color: "white",
          fontSize: "16px",
          cursor: isMining || cooldown > 0 ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isMining ? "Майнинг..." : cooldown > 0 ? `Перезарядка (${cooldown}с)` : "Майнить ⛏️"}

        {cooldown > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "4px",
              backgroundColor: "#3b82f6",
              width: `${(cooldown / 3) * 100}%`,
              transition: "width 0.1s linear",
            }}
          />
        )}
      </button>
    </div>
  )
}

export default App

