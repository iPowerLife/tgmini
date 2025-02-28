"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { LoadingScreen } from "./components/LoadingScreen"

// Начнем с простого компонента для проверки рендеринга
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log("🔄 App component mounted")

    // Простая проверка подключения
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from("users").select("count").single()
        if (error) throw error
        console.log("✅ Database connection successful")
        setIsInitialized(true)
      } catch (error) {
        console.error("❌ Connection error:", error)
        // Показываем ошибку на экране
        document.body.innerHTML = `
          <div style="
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #1a1b1e;
            color: white;
            padding: 20px;
            text-align: center;
          ">
            <div style="color: #ef4444; margin-bottom: 20px;">Ошибка подключения</div>
            <div style="color: #666;">${error.message}</div>
          </div>
        `
      }
    }

    checkConnection()
  }, [])

  if (!isInitialized) {
    return <LoadingScreen message="Подключение к серверу..." />
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Подключение установлено!</h1>
        <p>Если вы видите это сообщение, значит приложение работает корректно.</p>
      </div>
    </div>
  )
}

