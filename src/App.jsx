"use client"

import React from "react"

function App() {
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      setInitialized(true)
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "#1a1b1e",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Майнинг Игра</h1>
      <p>{initialized ? "Telegram WebApp готов!" : "Инициализация..."}</p>
    </div>
  )
}

export default App

