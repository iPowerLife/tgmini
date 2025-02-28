"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  console.log("🎮 Рендеринг App компонента")

  // Базовое состояние без начальной загрузки
  const [userData, setUserData] = useState({
    balance: 0,
    mining_power: 1,
  })

  useEffect(() => {
    console.log("🔄 Запуск эффекта загрузки данных")

    const loadUserData = async () => {
      try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
        console.log("👤 Данные Telegram пользователя:", telegramUser)

        if (!telegramUser?.id) {
          console.log("⚠️ Нет данных пользователя Telegram, используем тестовые данные")
          return
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (error) {
          console.error("❌ Ошибка загрузки пользователя:", error)
          return
        }

        console.log("✅ Данные пользователя загружены:", user)
        if (user) {
          setUserData(user)
        }
      } catch (error) {
        console.error("❌ Ошибка в loadUserData:", error)
      }
    }

    loadUserData()
  }, [])

  const handleMining = () => {
    console.log("⛏️ Майнинг...")
    setUserData((prev) => ({
      ...prev,
      balance: prev.balance + prev.mining_power,
    }))
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
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Статистика */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            display: "grid",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Баланс:</span>
            <span style={{ color: "#4ade80" }}>{userData.balance.toFixed(2)} 💎</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Мощность:</span>
            <span style={{ color: "#60a5fa" }}>{userData.mining_power.toFixed(1)} ⚡</span>
          </div>
        </div>

        {/* Кнопка майнинга */}
        <button
          onClick={handleMining}
          style={{
            padding: "20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Майнить ⛏️
        </button>
      </div>
    </div>
  )
}

