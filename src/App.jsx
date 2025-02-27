"use client"

import { useEffect, useState } from "react"

export default function App() {
  const [log, setLog] = useState([])

  useEffect(() => {
    // Добавляем лог
    const addLog = (message) => {
      console.log(message)
      setLog((prev) => [...prev, message])
    }

    try {
      addLog("App mounted")

      // Проверяем Telegram WebApp
      const tg = window.Telegram?.WebApp
      addLog(`Telegram WebApp: ${tg ? "Available" : "Not available"}`)

      if (tg) {
        // Проверяем данные пользователя
        const user = tg.initDataUnsafe?.user
        addLog(`User data: ${JSON.stringify(user)}`)

        // Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()
        addLog("Telegram WebApp initialized")
      }
    } catch (error) {
      addLog(`Error: ${error.message}`)
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>Telegram Mining Game</h1>

      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
        }}
      >
        <div>Статус: Приложение загружено</div>
        <div>Время: {new Date().toLocaleTimeString()}</div>
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        {log.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "15px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Перезагрузить
      </button>
    </div>
  )
}

