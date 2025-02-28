"use client"

import { useState } from "react"

export default function App() {
  const [balance, setBalance] = useState(0)
  const [miningPower, setMiningPower] = useState(1)

  const handleMining = () => {
    setBalance((prev) => prev + miningPower)
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
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Статистика */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            display: "grid",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Баланс:</span>
            <span style={{ color: "#4ade80" }}>{balance.toFixed(2)} 💎</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Мощность:</span>
            <span style={{ color: "#60a5fa" }}>{miningPower.toFixed(1)} ⚡</span>
          </div>
        </div>

        {/* Кнопка майнинга */}
        <button
          onClick={handleMining}
          style={{
            padding: "20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Майнить ⛏️
        </button>
      </div>
    </div>
  )
}

