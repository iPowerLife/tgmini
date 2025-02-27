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
  const [debugInfo, setDebugInfo] = React.useState({
    telegramWebAppAvailable: false,
    initDataReceived: false,
    userId: null,
    theme: null,
  })

  React.useEffect(() => {
    console.log("App mounted")
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      console.log("Initializing app...")

      // Проверяем доступность Telegram.WebApp
      const tgWebAppAvailable = Boolean(window.Telegram?.WebApp)
      console.log("Telegram WebApp available:", tgWebAppAvailable)

      setDebugInfo((prev) => ({
        ...prev,
        telegramWebAppAvailable: tgWebAppAvailable,
      }))

      if (tgWebAppAvailable) {
        const tg = window.Telegram.WebApp

        // Логируем информацию о теме
        console.log("Theme params:", {
          backgroundColor: tg.themeParams?.bg_color,
          textColor: tg.themeParams?.text_color,
        })

        setDebugInfo((prev) => ({
          ...prev,
          theme: tg.themeParams,
        }))

        tg.ready()
        tg.expand()

        // Проверяем наличие данных пользователя
        const userDataAvailable = Boolean(tg.initDataUnsafe?.user?.id)
        console.log("User data available:", userDataAvailable)

        setDebugInfo((prev) => ({
          ...prev,
          initDataReceived: userDataAvailable,
          userId: tg.initDataUnsafe?.user?.id,
        }))

        if (userDataAvailable) {
          await loadUserData(tg.initDataUnsafe.user.id)
        } else {
          throw new Error("Не удалось получить ID пользователя")
        }
      } else {
        throw new Error("Telegram WebApp не доступен")
      }
    } catch (err) {
      console.error("Initialization error:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  async function loadUserData(telegramId) {
    try {
      console.log("Loading user data for ID:", telegramId)
      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("User data loaded:", data)
      setUser(data)
    } catch (err) {
      console.error("Load user data error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function mine() {
    if (miningCooldown) return

    setMiningCooldown(true)
    try {
      console.log("Mining started...")
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

      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: user.mining_power,
          type: "mining",
          description: "Майнинг криптовалюты",
        },
      ])

      console.log("Mining successful, new balance:", data.balance)
      setUser(data)

      setTimeout(() => {
        setMiningCooldown(false)
      }, 3000)
    } catch (err) {
      console.error("Mining error:", err)
      setError(err.message)
      setMiningCooldown(false)
    }
  }

  // Отладочная информация всегда видна
  const renderDebugInfo = () => (
    <div className="debug-info">
      <div>Telegram WebApp доступен: {debugInfo.telegramWebAppAvailable ? "Да" : "Нет"}</div>
      <div>Данные инициализации получены: {debugInfo.initDataReceived ? "Да" : "Нет"}</div>
      <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
      <div>Тема: {JSON.stringify(debugInfo.theme)}</div>
      <div>Состояние загрузки: {loading ? "Да" : "Нет"}</div>
      <div>Ошибка: {error || "Нет"}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚡</div>
          <p>Загрузка...</p>
        </div>
        {renderDebugInfo()}
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
        {renderDebugInfo()}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "10px" }}>⛏️ Майнинг Игра</h1>
        <p>Привет, {user?.username || "Игрок"}!</p>
      </div>

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

      {renderDebugInfo()}
    </div>
  )
}

export default App

