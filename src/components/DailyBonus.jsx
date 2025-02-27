"use client"

import { useState, useEffect } from "react"

export function DailyBonus({ onClose, onClaim, lastClaim, streak = 0, isWeekend = false }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [showAnimation, setShowAnimation] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState(null)

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await onClaim()
      console.log("Claim result:", result) // Отладочный лог

      // Проверяем наличие результата
      if (!result) {
        throw new Error("Не удалось получить бонус")
      }

      // Проверяем успешность операции
      if (!result.success) {
        throw new Error(result.error || "Ошибка получения бонуса")
      }

      // Если бонус успешно получен
      if (result.bonus) {
        setClaimedBonus(result.bonus)
        setShowAnimation(true)
        setTimeout(() => {
          setShowAnimation(false)
          onClose()
        }, 3000)
      }
    } catch (err) {
      console.error("Error in handleClaim:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Обновляем таймер
  useEffect(() => {
    if (!lastClaim) return

    const updateTimer = () => {
      const now = new Date()
      const lastClaimDate = new Date(lastClaim)
      const nextClaim = new Date(lastClaimDate)
      nextClaim.setDate(nextClaim.getDate() + 1)
      nextClaim.setHours(0, 0, 0, 0)

      const diff = nextClaim - now
      if (diff <= 0) {
        setTimeLeft("")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}ч ${minutes}м`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 60000)
    return () => clearInterval(timer)
  }, [lastClaim])

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
          position: "relative",
          overflow: "hidden",
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
          <h2 style={{ margin: 0 }}>Ежедневный бонус {isWeekend && "🎉"}</h2>
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
            Серия: {streak} {streak > 0 && "🔥"}
          </div>
          <div style={{ color: "#4ade80" }}>
            Базовый бонус: 100 💎
            {streak > 1 && <div style={{ fontSize: "14px", marginTop: "5px" }}>+ {(streak - 1) * 10}% за серию</div>}
            {isWeekend && <div style={{ fontSize: "14px", marginTop: "5px" }}>x2 бонус в выходные! 🎉</div>}
          </div>
          {timeLeft && <div style={{ marginTop: "10px", color: "#666" }}>Следующий бонус через: {timeLeft}</div>}
          {error && <div style={{ color: "#ff4444", marginTop: "10px", fontSize: "14px" }}>{error}</div>}
        </div>

        <button
          onClick={handleClaim}
          disabled={isLoading || !!timeLeft}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: isLoading || timeLeft ? "#1f2937" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading || timeLeft ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "Получение бонуса..." : timeLeft ? "Приходите позже" : "Получить бонус"}
        </button>

        {/* Анимация получения бонуса */}
        {showAnimation && claimedBonus && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.5s ease-out",
              zIndex: 2,
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>+{claimedBonus.amount} 💎</div>
            <div style={{ color: "#4ade80" }}>
              {claimedBonus.type === "weekend" ? "Выходной x2!" : `Серия: ${claimedBonus.streak} 🔥`}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  )
}

