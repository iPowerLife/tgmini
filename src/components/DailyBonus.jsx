"use client"

import { useState, useEffect } from "react"

export function DailyBonus({ onClose, onClaim, lastClaim, streak = 0 }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [canClaim, setCanClaim] = useState(false)

  // Проверяем, можно ли получить бонус
  useEffect(() => {
    const checkBonus = () => {
      const now = new Date()
      const last = lastClaim ? new Date(lastClaim) : new Date(0)
      const nextClaim = new Date(last)
      nextClaim.setDate(nextClaim.getDate() + 1)
      nextClaim.setHours(0, 0, 0, 0)

      const diff = nextClaim - now
      setCanClaim(diff <= 0)

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours}ч ${minutes}м`)
      } else {
        setTimeLeft("")
      }
    }

    checkBonus()
    const timer = setInterval(checkBonus, 60000) // Обновляем каждую минуту
    return () => clearInterval(timer)
  }, [lastClaim])

  // Рассчитываем бонус на основе серии
  const calculateBonus = () => {
    const baseBonus = 100
    const multiplier = Math.min(2, 1 + streak * 0.1) // Максимальный множитель 2x
    return Math.floor(baseBonus * multiplier)
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1b1e",
          borderRadius: "12px",
          padding: "20px",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Ежедневный бонус 🎁</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            Серия: {streak} {streak > 0 ? "🔥" : ""}
          </div>
          <div style={{ color: "#4ade80" }}>Бонус: {calculateBonus()} 💎</div>
          {!canClaim && <div style={{ color: "#666", marginTop: "10px" }}>Следующий бонус через: {timeLeft}</div>}
        </div>

        <button
          onClick={() => onClaim(calculateBonus())}
          disabled={!canClaim}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: canClaim ? "#3b82f6" : "#1f2937",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: canClaim ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {canClaim ? "Получить бонус" : "Приходите завтра"}
        </button>
      </div>
    </div>
  )
}

