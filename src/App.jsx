"use client"

import React from "react"
import { testConnection } from "./supabase"

function App() {
  const [connectionStatus, setConnectionStatus] = React.useState({
    loading: true,
    success: false,
    steps: {},
    error: null,
  })

  React.useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      console.log("Starting connection test...")
      const result = await testConnection()
      console.log("Connection test result:", result)
      setConnectionStatus({
        loading: false,
        success: result.success,
        steps: result.steps,
        error: result.error,
      })
    } catch (err) {
      console.error("Connection check failed:", err)
      setConnectionStatus({
        loading: false,
        success: false,
        steps: {},
        error: err.message,
      })
    }
  }

  if (connectionStatus.loading) {
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
        <h2>Проверка подключения к базе данных...</h2>
      </div>
    )
  }

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
          background: connectionStatus.success ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h2>Статус подключения</h2>
        <p>{connectionStatus.success ? "Подключено успешно" : "Ошибка подключения"}</p>
        {connectionStatus.error && <p style={{ color: "#ff6b6b" }}>{connectionStatus.error}</p>}
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>Проверка компонентов:</h3>
        <div style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Базовое подключение: </span>
            <span style={{ color: connectionStatus.steps.connection ? "#4ade80" : "#ff6b6b" }}>
              {connectionStatus.steps.connection ? "✓" : "✗"}
            </span>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Таблица users: </span>
            <span style={{ color: connectionStatus.steps.usersTable ? "#4ade80" : "#ff6b6b" }}>
              {connectionStatus.steps.usersTable ? "✓" : "✗"}
            </span>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Таблица levels: </span>
            <span style={{ color: connectionStatus.steps.levelsTable ? "#4ade80" : "#ff6b6b" }}>
              {connectionStatus.steps.levelsTable ? "✓" : "✗"}
            </span>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Таблица transactions: </span>
            <span style={{ color: connectionStatus.steps.transactionsTable ? "#4ade80" : "#ff6b6b" }}>
              {connectionStatus.steps.transactionsTable ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setConnectionStatus({ loading: true, success: false, steps: {}, error: null })
          checkConnection()
        }}
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#3b82f6",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Проверить снова
      </button>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <p>URL: {process.env.VITE_SUPABASE_URL || "Не задан"}</p>
        <p>Время проверки: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default App

