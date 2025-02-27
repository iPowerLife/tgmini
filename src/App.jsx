"use client"

import { useState, useEffect, useCallback } from "react"

// Простой компонент без Supabase и сложной логики
export default function App() {
  const [logs, setLogs] = useState([])
  const [stage, setStage] = useState("initializing")

  // Функция для логирования
  const addLog = useCallback((message) => {
    console.log(message) // Дублируем в консоль
    setLogs((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`])
  }, [])

  // Эффект инициализации
  useEffect(() => {
    const initialize = async () => {
      try {
        addLog("Приложение запускается")
        setStage("checking-telegram")

        // Проверяем Telegram WebApp
        const tg = window.Telegram?.WebApp
        addLog(`Telegram WebApp: ${tg ? "доступен" : "недоступен"}`)

        if (!tg) {
          throw new Error("Telegram WebApp не доступен")
        }

        // Проверяем данные пользователя
        const user = tg.initDataUnsafe?.user
        addLog(`Данные пользователя: ${user ? "получены" : "недоступны"}`)

        if (!user) {
          throw new Error("Данные пользователя недоступны")
        }

        // Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()
        addLog("Telegram WebApp инициализирован")

        setStage("ready")
      } catch (error) {
        addLog(`Ошибка: ${error.message}`)
        setStage("error")
      }
    }

    initialize()
  }, [addLog])

  // Если идет инициализация
  if (stage === "initializing" || stage === "checking-telegram") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1b1e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          gap: "20px",
        }}
      >
        <div style={{ fontSize: "18px" }}>
          {stage === "initializing" ? "Загрузка приложения..." : "Подключение к Telegram..."}
        </div>

        {/* Спиннер */}
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #3b82f6",
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        {/* Логи */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "300px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {log}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Если произошла ошибка
  if (stage === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1b1e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          gap: "20px",
        }}
      >
        <div style={{ color: "#ff4444", fontSize: "18px", marginBottom: "20px" }}>Ошибка при загрузке приложения</div>

        {/* Логи */}
        <div
          style={{
            padding: "10px",
            background: "rgba(255,68,68,0.1)",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "300px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {log}
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  // Основной интерфейс
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        gap: "20px",
      }}
    >
      <h1>Telegram Mining Game</h1>
      <div>Приложение успешно загружено!</div>

      {/* Отладочная информация */}
      <div
        style={{
          marginTop: "40px",
          padding: "10px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "300px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ marginBottom: "10px", color: "#4ade80" }}>Лог загрузки:</div>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: "4px" }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}

