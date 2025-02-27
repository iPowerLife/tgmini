"use client"

import { useState } from "react"

export function DailyBonus({ onClose, onClaim, lastClaim, streak = 0 }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const amount = 100 // Фиксированный бонус для упрощения
      await onClaim(amount)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
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
          <div style={{ marginBottom: "10px" }}>Бонус: 100 💎</div>
          {error && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "10px" }}>{error}</div>}
        </div>

        <button
          onClick={handleClaim}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: isLoading ? "#1f2937" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "Получение бонуса..." : "Получить бонус"}
        </button>
      </div>
    </div>
  )
}

