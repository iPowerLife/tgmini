"use client"

import React from "react"

function App() {
  const [status, setStatus] = React.useState("⚡ Приложение запущено")
  const [clicks, setClicks] = React.useState(0)
  const [tgInfo, setTgInfo] = React.useState(null)

  React.useEffect(() => {
    try {
      // Проверяем Telegram WebApp
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        setTgInfo({
          platform: tg.platform,
          version: tg.version,
          colorScheme: tg.colorScheme,
        })

        setStatus("✅ Telegram WebApp подключен")
      } else {
        setStatus("❌ Telegram WebApp не найден")
      }
    } catch (err) {
      setStatus("🚫 Ошибка: " + err.message)
    }
  }, [])

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: "15px" }}>🎮 Майнинг Игра</h1>
        <p className="status">{status}</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "10px" }}>Тестовые кнопки</h2>
        <p style={{ marginBottom: "15px" }}>Нажатий: {clicks}</p>
        <button
          className="button"
          onClick={() => {
            setClicks((c) => c + 1)
            setStatus("🖱️ Кнопка работает!")
          }}
        >
          Нажми меня!
        </button>
      </div>

      {tgInfo && (
        <div className="card">
          <h3 style={{ marginBottom: "10px" }}>Информация Telegram</h3>
          <p>Платформа: {tgInfo.platform}</p>
          <p>Версия: {tgInfo.version}</p>
          <p>Тема: {tgInfo.colorScheme}</p>
        </div>
      )}
    </div>
  )
}

export default App

