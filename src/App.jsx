"use client"

import { useState } from "react"

function App() {
  const [balance, setBalance] = useState(0)
  const [isMining, setIsMining] = useState(false)

  const handleMining = () => {
    if (isMining) return
    setIsMining(true)
    setTimeout(() => {
      setBalance((prev) => prev + 1)
      setIsMining(false)
    }, 1000)
  }

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Баланс:</span>
          <span>{balance.toFixed(2)} 💎</span>
        </div>
      </div>

      <button
        onClick={handleMining}
        disabled={isMining}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          backgroundColor: isMining ? "#1f2937" : "#3b82f6",
          border: "none",
          borderRadius: "12px",
          color: "white",
          fontSize: "16px",
          cursor: isMining ? "not-allowed" : "pointer",
        }}
      >
        {isMining ? "Майнинг..." : "Майнить ⛏️"}
      </button>
    </div>
  )
}

export default App

