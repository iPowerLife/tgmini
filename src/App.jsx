"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

function App() {
  // Состояние для данных пользователя
  const [stats, setStats] = useState({
    balance: 0,
    mining_power: 1,
  })

  // Состояние для кнопки майнинга
  const [isMining, setIsMining] = useState(false)

  // Загрузка данных пользователя
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Получаем данные из Telegram
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
        if (!telegramUser?.id) return

        // Получаем данные из базы
        const { data: user } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

        // Если пользователь найден, обновляем состояние
        if (user) {
          setStats({
            balance: user.balance,
            mining_power: user.mining_power,
          })
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      }
    }

    loadUserData()
  }, [])

  // Функция майнинга
  const handleMining = async () => {
    if (isMining) return
    setIsMining(true)

    try {
      // Получаем данные из Telegram
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user

      // Обновляем локальное состояние
      const newBalance = stats.balance + stats.mining_power
      setStats((prev) => ({
        ...prev,
        balance: newBalance,
      }))

      // Если есть данные пользователя, сохраняем в базу
      if (telegramUser?.id) {
        await supabase.from("users").update({ balance: newBalance }).eq("telegram_id", telegramUser.id)

        // Логируем транзакцию
        await supabase.from("transactions").insert([
          {
            user_id: telegramUser.id,
            amount: stats.mining_power,
            type: "mining",
            description: "Майнинг криптовалюты",
          },
        ])
      }
    } catch (error) {
      console.error("Ошибка майнинга:", error)
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
          <span>{stats.balance.toFixed(2)} 💎</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Мощность:</span>
          <span>{stats.mining_power.toFixed(1)} ⚡</span>
        </div>
      </div>

      <button
        onClick={handleMining}
        disabled={isMining}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          backgroundColor: isMining ? "#1f2937" : "#3b82f6",
          border: "none",
          borderRadius: "12px",
          color: "white",
          fontSize: "16px",
          cursor: isMining ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
      >
        {isMining ? "Майнинг..." : "Майнить ⛏️"}
      </button>
    </div>
  )
}

export default App

