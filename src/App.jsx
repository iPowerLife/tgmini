"use client"

import React from "react"

function App() {
  const [debug, setDebug] = React.useState({
    initialized: false,
    telegramWebApp: null,
    error: null,
  })

  React.useEffect(() => {
    try {
      // Проверяем доступность Telegram WebApp
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp

        // Устанавливаем тему
        document.documentElement.style.backgroundColor = "#1a1b1e"
        document.body.style.backgroundColor = "#1a1b1e"

        setDebug({
          initialized: true,
          telegramWebApp: {
            platform: tg.platform,
            version: tg.version,
            initData: tg.initData,
            colorScheme: tg.colorScheme,
            themeParams: tg.themeParams,
          },
          error: null,
        })
      } else {
        setDebug({
          initialized: false,
          telegramWebApp: null,
          error: "Telegram WebApp не доступен",
        })
      }
    } catch (err) {
      setDebug({
        initialized: false,
        telegramWebApp: null,
        error: err.message,
      })
    }
  }, [])

  return (
    <div className="container">
      <h1>Тестовая страница</h1>

      {debug.error ? (
        <div style={{ color: "red", marginTop: "20px" }}>Ошибка: {debug.error}</div>
      ) : (
        <p>{debug.initialized ? "Telegram WebApp инициализирован успешно!" : "Инициализация..."}</p>
      )}

      <div className="debug">{JSON.stringify(debug, null, 2)}</div>
    </div>
  )
}

export default App

