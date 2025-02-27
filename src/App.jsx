"use client"

import React from "react"
import { createClient } from "@supabase/supabase-js"

// Инициализация Supabase с существующими данными
const supabase = createClient(
  "https://tphsnmoitxericjvgwwn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ",
)

function App() {
  const [debug, setDebug] = React.useState({
    stage: "initializing",
    telegramWebApp: null,
    error: null,
  })

  React.useEffect(() => {
    try {
      setDebug((prev) => ({ ...prev, stage: "checking-telegram" }))

      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        setDebug((prev) => ({
          ...prev,
          stage: "telegram-ready",
          telegramWebApp: {
            platform: tg.platform,
            version: tg.version,
            initData: tg.initData,
            colorScheme: tg.colorScheme,
          },
        }))

        // Проверяем данные пользователя
        if (tg.initDataUnsafe?.user?.id) {
          checkUser(tg.initDataUnsafe.user)
        } else {
          setDebug((prev) => ({
            ...prev,
            stage: "error",
            error: "Не удалось получить данные пользователя",
          }))
        }
      } else {
        setDebug((prev) => ({
          ...prev,
          stage: "error",
          error: "Telegram WebApp не доступен",
        }))
      }
    } catch (err) {
      setDebug((prev) => ({
        ...prev,
        stage: "error",
        error: err.message,
      }))
    }
  }, [])

  async function checkUser(telegramUser) {
    try {
      setDebug((prev) => ({ ...prev, stage: "checking-user" }))

      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

      if (error) {
        throw error
      }

      setDebug((prev) => ({
        ...prev,
        stage: "user-loaded",
        user: data,
      }))
    } catch (err) {
      setDebug((prev) => ({
        ...prev,
        stage: "error",
        error: err.message,
      }))
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "20px" }}>⛏️ Майнинг Игра</h1>
        <p>Статус: {debug.stage}</p>
      </div>

      {debug.error && (
        <div
          className="card"
          style={{
            textAlign: "center",
            background: "rgba(255,0,0,0.1)",
            borderColor: "red",
          }}
        >
          <h3>Ошибка:</h3>
          <p>{debug.error}</p>
        </div>
      )}

      <div className="debug">
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
    </div>
  )
}

export default App

