"use client"

import React from "react"

function App() {
  const [debugInfo, setDebugInfo] = React.useState({
    telegramWebAppAvailable: false,
    initDataReceived: false,
    userId: null,
    theme: null,
    error: null,
  })

  React.useEffect(() => {
    try {
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
        console.log("Theme params:", tg.themeParams)

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
      } else {
        throw new Error("Telegram WebApp не доступен")
      }
    } catch (err) {
      console.error("Initialization error:", err)
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
        <p>Если вы видите это сообщение, значит приложение работает!</p>
      </div>

      <div className="debug-info">
        <div>Telegram WebApp доступен: {debugInfo.telegramWebAppAvailable ? "Да" : "Нет"}</div>
        <div>Данные инициализации получены: {debugInfo.initDataReceived ? "Да" : "Нет"}</div>
        <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
        <div>Тема: {JSON.stringify(debugInfo.theme)}</div>
        <div>Ошибка: {debugInfo.error || "Нет"}</div>
      </div>
    </div>
  )
}

export default App

