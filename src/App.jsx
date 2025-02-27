"use client"

import React from "react"

function App() {
  const [debugInfo, setDebugInfo] = React.useState({
    telegramWebAppAvailable: false,
    initDataReceived: false,
    userId: null,
    error: null,
    host: window.location.host,
  })

  React.useEffect(() => {
    try {
      const tgWebAppAvailable = Boolean(window.Telegram?.WebApp)
      console.log("Telegram WebApp available:", tgWebAppAvailable)
      console.log("Current host:", window.location.host)

      setDebugInfo((prev) => ({
        ...prev,
        telegramWebAppAvailable: tgWebAppAvailable,
      }))

      if (tgWebAppAvailable) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        setDebugInfo((prev) => ({
          ...prev,
          initDataReceived: Boolean(tg.initDataUnsafe?.user?.id),
          userId: tg.initDataUnsafe?.user?.id,
        }))
      }
    } catch (err) {
      console.error("Error:", err)
      setDebugInfo((prev) => ({
        ...prev,
        error: err.message,
      }))
    }
  }, [])

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>Тестовая страница</h1>
        <p>Версия 1.0</p>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <div>Текущий хост: {debugInfo.host}</div>
        <div>Telegram WebApp доступен: {debugInfo.telegramWebAppAvailable ? "Да" : "Нет"}</div>
        <div>Данные получены: {debugInfo.initDataReceived ? "Да" : "Нет"}</div>
        <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
        <div>Ошибка: {debugInfo.error || "Нет"}</div>
      </div>
    </div>
  )
}

export default App

