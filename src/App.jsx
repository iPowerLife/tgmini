"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [userData, setUserData] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Инициализация в фоновом режиме
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram?.WebApp
        if (!tg || !tg.initDataUnsafe?.user) return

        const telegramUser = tg.initDataUnsafe.user

        // Получаем или создаем пользователя
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (existingUser) {
          setUserData(existingUser)
        } else {
          const { data: newUser } = await supabase
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

          if (newUser) setUserData(newUser)
        }

        // Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()
      } catch (error) {
        console.error("Ошибка инициализации:", error)
      }
    }

    initializeUser()
  }, [])

  // Функция майнинга
  const handleMining = async () => {
    if (isMining || cooldown > 0 || !userData) return

    try {
      setIsMining(true)

      const { data } = await supabase
        .from("users")
        .update({
          balance: userData.balance + userData.mining_power,
          last_mining: new Date().toISOString(),
        })
        .eq("id", userData.id)
        .select()
        .single()

      if (data) {
        setUserData(data)
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
      }
    } catch (error) {
      console.error("Ошибка майнинга:", error)
    } finally {
      setIsMining(false)
    }
  }

  // Сразу показываем интерфейс
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
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Crypto Mining Game</h1>

      {userData && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>Баланс: {userData.balance.toFixed(2)} 💎</div>
          <div style={{ marginBottom: "10px" }}>Мощность: {userData.mining_power.toFixed(1)} ⚡</div>
          <div>Уровень: {userData.level} ✨</div>
        </div>
      )}

      <button
        onClick={handleMining}
        disabled={isMining || cooldown > 0 || !userData}
        style={{
          padding: "20px",
          backgroundColor: isMining || cooldown > 0 || !userData ? "#1f2937" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: isMining || cooldown > 0 || !userData ? "not-allowed" : "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!userData
          ? "Загрузка..."
          : isMining
            ? "Майнинг..."
            : cooldown > 0
              ? `Перезарядка (${cooldown}с)`
              : "Начать майнинг ⛏️"}

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
    </div>
  )
}

