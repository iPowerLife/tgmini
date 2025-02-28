"use client"

import { useState, useCallback } from "react"

function App() {
  const [balance, setBalance] = useState(0)
  const [miningPower, setMiningPower] = useState(1)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const mine = useCallback(() => {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    const amount = miningPower

    // Добавляем небольшую задержку для эффекта
    setTimeout(() => {
      setBalance((prev) => +(prev + amount).toFixed(2))
      setIsMining(false)

      // Устанавливаем кулдаун
      setCooldown(3)
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 500)
  }, [isMining, cooldown, miningPower])

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
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
          <span>Баланс:</span>
          <span>{balance.toFixed(2)} 💎</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Мощность:</span>
          <span>{miningPower.toFixed(1)} ⚡</span>
        </div>
      </div>

      <button
        onClick={mine}
        disabled={isMining || cooldown > 0}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          backgroundColor: isMining || cooldown > 0 ? "#1f2937" : "#3b82f6",
          border: "none",
          borderRadius: "12px",
          color: "white",
          fontSize: "16px",
          cursor: isMining || cooldown > 0 ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isMining ? "Майнинг..." : cooldown > 0 ? `Перезарядка (${cooldown}с)` : "Майнить ⛏️"}

        {/* Индикатор перезарядки */}
        {cooldown > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "4px",
              backgroundColor: "#3b82f6",
              width: `${(cooldown / 3) * 100}%`,
              transition: "width 0.1s linear",
            }}
          />
        )}
      </button>
    </div>
  )
}

export default App

