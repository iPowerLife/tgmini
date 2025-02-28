"use client"

import { useState, useEffect } from "react"

// Максимально простой компонент без внешних зависимостей
export default function App() {
  const [message, setMessage] = useState("Инициализация...")

  useEffect(() => {
    console.log("App mounted")
    setMessage("Приложение загружено!")
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
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>{message}</h1>
      <p>Базовая версия приложения</p>
    </div>
  )
}

