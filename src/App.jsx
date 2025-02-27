"use client"

import React from "react"

function App() {
  const [status, setStatus] = React.useState("initializing")
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    try {
      console.log("App component mounted")

      // Проверяем доступность Telegram WebApp
      if (!window.Telegram?.WebApp) {
        throw new Error("Telegram WebApp не доступен")
      }

      const tg = window.Telegram.WebApp

      // Логируем информацию о WebApp
      console.log("Telegram WebApp info:", {
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
      })

      // Инициализируем WebApp
      tg.ready()
      tg.expand()

      setStatus("ready")
    } catch (err) {
      console.error("Error in App useEffect:", err)
      setError(err.message)
      setStatus("error")
    }
  }, [])

  // Простой компонент для отображения состояния
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>Статус: {status}</h1>
      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "rgba(255,0,0,0.2)",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          Ошибка: {error}
        </div>
      )}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "4px",
        }}
      >
        <pre>
          {JSON.stringify(
            {
              telegramAvailable: Boolean(window.Telegram),
              webAppAvailable: Boolean(window.Telegram?.WebApp),
              platform: window.Telegram?.WebApp?.platform || "unknown",
              time: new Date().toISOString(),
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}

export default App

