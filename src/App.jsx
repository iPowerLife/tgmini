"use client"

import React from "react"

function App() {
  const [count, setCount] = React.useState(0)
  const [bgColor, setBgColor] = React.useState("#1a1b1e")
  const [debug, setDebug] = React.useState("Инициализация...")

  React.useEffect(() => {
    // Проверяем работу React
    setDebug((prev) => prev + "\nReact работает")

    // Проверяем Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      setDebug((prev) => prev + "\nTelegram WebApp доступен")
      setDebug((prev) => prev + "\nПлатформа: " + tg.platform)
    } else {
      setDebug((prev) => prev + "\nTelegram WebApp НЕ доступен")
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s",
      }}
    >
      <h1 style={{ marginBottom: "20px", color: "white" }}>🎮 Тестовая страница</h1>

      <div className="counter" style={{ color: "white" }}>
        Счётчик: {count}
      </div>

      <div>
        <button className="test-button" onClick={() => setCount((c) => c + 1)}>
          Увеличить
        </button>

        <button className="test-button" onClick={() => setCount((c) => c - 1)}>
          Уменьшить
        </button>
      </div>

      <div>
        <button className="test-button" onClick={() => setBgColor((bg) => (bg === "#1a1b1e" ? "#2d2d2d" : "#1a1b1e"))}>
          Сменить фон
        </button>
      </div>

      <pre className="debug">{debug}</pre>
    </div>
  )
}

export default App

