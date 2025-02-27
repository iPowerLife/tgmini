"use client"

import React from "react"

function App() {
  const [debugInfo, setDebugInfo] = React.useState({
    telegramWebAppAvailable: false,
    initDataReceived: false,
    userId: null,
    error: null,
  })

  React.useEffect(() => {
    try {
      const tgWebAppAvailable = Boolean(window.Telegram?.WebApp)
      console.log("Telegram WebApp available:", tgWebAppAvailable)

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
    <div className="container">
      <div className="card">
        <h1>Тестовая страница</h1>
        <p>Версия 1.0</p>
      </div>

      <div className="debug-info">
        <div>Telegram WebApp доступен: {debugInfo.telegramWebAppAvailable ? "Да" : "Нет"}</div>
        <div>Данные получены: {debugInfo.initDataReceived ? "Да" : "Нет"}</div>
        <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
        <div>Ошибка: {debugInfo.error || "Нет"}</div>
      </div>
    </div>
  )
}

export default App

