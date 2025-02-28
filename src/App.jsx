"use client"

import { useState } from "react"

function App() {
  const [balance, setBalance] = useState(0)
  const [isMining, setIsMining] = useState(false)
  const [showIncrease, setShowIncrease] = useState(false)

  const handleMining = () => {
    if (isMining) return
    setIsMining(true)
    setTimeout(() => {
      setBalance((prev) => prev + 1)
      setShowIncrease(true)
      setTimeout(() => setShowIncrease(false), 1000)
      setIsMining(false)
    }, 1000)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #0f172a, #1e293b)",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Анимированный фоновый градиент */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent)",
          animation: "pulse 8s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* Футуристические декоративные элементы */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "50%",
          animation: "rotate 20s linear infinite",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "150px",
          height: "150px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "50%",
          animation: "rotate 15s linear infinite reverse",
          zIndex: 1,
        }}
      />

      {/* Основной контент */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Карточка баланса */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(10px)",
            padding: "30px",
            borderRadius: "20px",
            marginBottom: "30px",
            width: "300px",
            boxShadow: "20px 20px 60px #1a1b1e, -20px -20px 60px #1e293b",
            border: "1px solid rgba(99, 102, 241, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Футуристический фон карточки */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.1))",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: "0.9em",
                color: "#94a3b8",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Баланс
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "2.5em",
                fontWeight: "bold",
                color: "#f8fafc",
                textShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
              }}
            >
              <span style={{ position: "relative" }}>
                {balance.toFixed(2)}
                {showIncrease && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      color: "#4ade80",
                      fontSize: "0.5em",
                      animation: "fadeUp 1s ease-out",
                    }}
                  >
                    +1
                  </span>
                )}
              </span>
              <span style={{ fontSize: "0.8em" }}>💎</span>
            </div>
          </div>
        </div>

        {/* Кнопка майнинга */}
        <button
          onClick={handleMining}
          disabled={isMining}
          style={{
            width: "300px",
            padding: "20px",
            backgroundColor: isMining ? "#1f2937" : "rgba(99, 102, 241, 0.9)",
            border: "none",
            borderRadius: "15px",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            cursor: isMining ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            boxShadow: isMining ? "none" : "0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
              animation: isMining ? "none" : "shine 2s infinite",
            }}
          />
          <span style={{ position: "relative", zIndex: 2 }}>{isMining ? "Майнинг..." : "Майнить ⛏️"}</span>
        </button>
      </div>

      {/* Стили для анимаций */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 0.5; transform: scale(1); }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes shine {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
          }

          @keyframes fadeUp {
            from { 
              opacity: 1;
              transform: translateY(0);
            }
            to { 
              opacity: 0;
              transform: translateY(-20px);
            }
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.2);
          }

          button:not(:disabled):active {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  )
}

export default App

