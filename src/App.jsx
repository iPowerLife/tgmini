"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [status, setStatus] = useState("Инициализация...")
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        // Проверяем, что React работает
        setStatus("React работает")

        // Проверяем Telegram WebApp
        const tg = window.Telegram?.WebApp
        if (!tg) {
          throw new Error("Telegram WebApp не доступен")
        }
        setStatus("Telegram WebApp доступен")

        // Проверяем данные пользователя Telegram
        const user = tg.initDataUnsafe?.user
        if (!user) {
          throw new Error("Данные пользователя Telegram не доступны")
        }
        setStatus(`Пользователь Telegram: ${user.username || user.id}`)

        // Проверяем подключение к Supabase
        const { data, error } = await supabase.from("users").select("count")
        if (error) {
          throw new Error(`Ошибка Supabase: ${error.message}`)
        }
        setStatus("Подключение к Supabase работает")
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        setError(err.message)
      }
    }

    init()
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
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Telegram Mining Game</h1>

      <div
        style={{
          backgroundColor: "#2d2d2d",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "80%",
          width: "400px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>Статус: {status}</div>

        {error && (
          <div
            style={{
              color: "#ff4444",
              padding: "10px",
              backgroundColor: "#ff44441a",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            Ошибка: {error}
          </div>
        )}

        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "20px",
          }}
        >
          Версия: {import.meta.env.VITE_APP_VERSION || "1.0.0"}
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Перезагрузить
      </button>

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          right: "20px",
          padding: "10px",
          backgroundColor: "#2d2d2d",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        Environment: {import.meta.env.MODE}
        <br />
        Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? "Настроен" : "Не настроен"}
      </div>
    </div>
  )
}

