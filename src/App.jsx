"use client"

import React from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://tphsnmoitxericjvgwwn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ",
)

function App() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [miningCooldown, setMiningCooldown] = React.useState(false)

  React.useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        if (tg.initDataUnsafe?.user?.id) {
          await loadUserData(tg.initDataUnsafe.user.id)
        } else {
          throw new Error("Не удалось получить ID пользователя")
        }
      } else {
        throw new Error("Telegram WebApp не доступен")
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function loadUserData(telegramId) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

      if (error) throw error

      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function mine() {
    if (miningCooldown) {
      return
    }

    setMiningCooldown(true)

    try {
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

      // Записываем транзакцию
      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: user.mining_power,
          type: "mining",
          description: "Майнинг криптовалюты",
        },
      ])

      setUser(data)

      // Устанавливаем задержку в 3 секунды между майнингом
      setTimeout(() => {
        setMiningCooldown(false)
      }, 3000)
    } catch (err) {
      setError(err.message)
      setMiningCooldown(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚡</div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", background: "rgba(255,0,0,0.1)" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚠️</div>
          <h3>Ошибка</h3>
          <p style={{ marginTop: "10px", color: "#ff6b6b" }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Приветствие */}
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "10px" }}>⛏️ Майнинг Игра</h1>
        <p>Привет, {user?.username || "Игрок"}!</p>
      </div>

      {/* Статистика */}
      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "5px" }}>Баланс:</h3>
          <p style={{ fontSize: "24px" }}>{user?.balance?.toFixed(2)} 💰</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "5px" }}>Мощность майнинга:</h3>
          <p style={{ fontSize: "24px" }}>{user?.mining_power?.toFixed(2)} ⚡</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "5px" }}>Уровень:</h3>
          <p style={{ fontSize: "24px" }}>{user?.level || 1} 🏆</p>
        </div>

        <button
          className="button"
          onClick={mine}
          style={{
            opacity: miningCooldown ? 0.7 : 1,
            cursor: miningCooldown ? "not-allowed" : "pointer",
          }}
        >
          {miningCooldown ? "Майнинг..." : "Майнить"}
        </button>
      </div>

      {/* Прогресс уровня */}
      <div className="card">
        <h3 style={{ marginBottom: "10px" }}>Прогресс уровня:</h3>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: "10px",
            height: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(user?.experience / user?.next_level_exp) * 100}%`,
              height: "100%",
              background: "#3b82f6",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: "5px",
            fontSize: "14px",
            color: "#a0aec0",
          }}
        >
          {user?.experience || 0} / {user?.next_level_exp || 100} XP
        </p>
      </div>
    </div>
  )
}

export default App

