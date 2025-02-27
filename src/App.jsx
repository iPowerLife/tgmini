"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [logs, setLogs] = useState([])
  const [stage, setStage] = useState("initializing")
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Функция для логирования
  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    console.log(`${timestamp} - ${message}`)
    setLogs((prev) => [...prev, { time: timestamp, message }])
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
        const telegramUser = tg.initDataUnsafe?.user
        addLog(`Данные пользователя: ${telegramUser ? "получены" : "недоступны"}`)

        if (!telegramUser) {
          throw new Error("Данные пользователя недоступны")
        }

        // Получаем или создаем пользователя в базе данных
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        if (!existingUser) {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                balance: 0,
                mining_power: 1,
                level: 1,
                experience: 0,
                next_level_exp: 100,
                last_mining: new Date().toISOString(),
              },
            ])
            .select()
            .single()

          if (createError) throw createError
          setUser(newUser)
          addLog("Создан новый пользователь")
        } else {
          setUser(existingUser)
          addLog("Загружен существующий пользователь")
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

  // Функция майнинга
  const handleMining = async () => {
    if (isMining || cooldown > 0 || !user) return

    try {
      setIsMining(true)
      addLog("Начинаем майнинг...")

      const { data, error } = await supabase
        .from("users")
        .update({
          balance: user.balance + user.mining_power,
          last_mining: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      addLog(`Добыто ${user.mining_power} монет`)

      // Устанавливаем кулдаун
      setCooldown(60)
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      addLog(`Ошибка майнинга: ${error.message}`)
    } finally {
      setIsMining(false)
    }
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
        padding: "20px",
        gap: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Telegram Mining Game</h1>

      {stage === "ready" ? (
        <>
          <div style={{ textAlign: "center" }}>Приложение успешно загружено!</div>

          {user && (
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ marginBottom: "10px" }}>Баланс: {user.balance.toFixed(2)} 💎</div>
              <div style={{ marginBottom: "10px" }}>Мощность: {user.mining_power.toFixed(1)} ⚡</div>
              <div>Уровень: {user.level} ✨</div>
            </div>
          )}

          <button
            onClick={handleMining}
            disabled={isMining || cooldown > 0}
            style={{
              padding: "20px",
              backgroundColor: isMining || cooldown > 0 ? "#1f2937" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isMining || cooldown > 0 ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isMining ? "Майнинг..." : cooldown > 0 ? `Перезарядка (${cooldown}с)` : "Начать майнинг ⛏️"}

            {cooldown > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "4px",
                  backgroundColor: "#3b82f6",
                  width: `${(cooldown / 60) * 100}%`,
                  transition: "width 1s linear",
                }}
              />
            )}
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#666" }}>
          {stage === "error" ? "Ошибка загрузки" : "Загрузка..."}
        </div>
      )}

      {/* Логи */}
      <div
        style={{
          marginTop: "auto",
          padding: "15px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <div style={{ color: "#4ade80", marginBottom: "10px" }}>Лог загрузки:</div>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: "4px" }}>
            <span style={{ color: "#666" }}>{log.time}</span> - {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}

