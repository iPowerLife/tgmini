"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [isMining, setIsMining] = useState(false)
  const [showIncrease, setShowIncrease] = useState(false)
  const [particles, setParticles] = useState([])
  const [tg, setTg] = useState(null)

  // Инициализируем Telegram WebApp
  useEffect(() => {
    const telegram = initTelegram()
    setTg(telegram)
  }, [])

  // Получаем или создаем пользователя при загрузке
  useEffect(() => {
    const initUser = async () => {
      try {
        const telegramUser = getTelegramUser()
        if (!telegramUser) {
          console.error("No Telegram user found")
          return
        }

        console.log("Initializing user:", telegramUser)

        // Ищем пользователя в базе
        let { data: user, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (selectError) {
          console.error("Error selecting user:", selectError)
        }

        // Если пользователя нет, создаем
        if (!user) {
          console.log("Creating new user...")
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              telegram_id: telegramUser.id,
              username: telegramUser.username || "unknown",
              balance: 0,
              mining_power: 1,
              level: 1,
              experience: 0,
              next_level_exp: 100,
            })
            .select()
            .single()

          if (createError) {
            console.error("Error creating user:", createError)
            throw createError
          }

          console.log("Created user:", newUser)

          // Создаем запись в mining_stats
          const { error: statsError } = await supabase.from("mining_stats").insert({
            user_id: newUser.id,
            total_mined: 0,
            mining_count: 0,
          })

          if (statsError) {
            console.error("Error creating mining stats:", statsError)
            throw statsError
          }

          user = newUser
        }

        console.log("Setting user:", user)
        setUser(user)
        setBalance(user.balance)
      } catch (error) {
        console.error("Error initializing user:", error)
      }
    }

    initUser()
  }, [])

  const createParticle = (e) => {
    if (!e?.target) return // Проверяем наличие event и target

    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const particles = []
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      particles.push({
        id: Date.now() + i,
        x,
        y,
        angle,
        speed: 2 + Math.random() * 2,
        life: 1,
      })
    }
    setParticles(particles)
    setTimeout(() => setParticles([]), 1000)
  }

  const handleMining = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isMining || !user) return

    try {
      createParticle(e)
      setIsMining(true)

      // Обновляем баланс в базе с полными параметрами
      const { data, error } = await supabase.rpc("update_user_balance", {
        user_id_param: user.id,
        amount_param: 1,
        type_param: "mining",
        description_param: "Mining reward",
      })

      if (error) {
        console.error("Error updating balance:", error)
        throw error
      }

      // Обновляем статистику майнинга
      const { error: statsError } = await supabase.rpc("update_mining_stats", {
        user_id_param: user.id,
        mined_amount: 1,
      })

      if (statsError) {
        console.error("Error updating stats:", statsError)
        throw statsError
      }

      setBalance((prev) => prev + 1)
      setShowIncrease(true)
      setTimeout(() => setShowIncrease(false), 1000)
    } catch (error) {
      console.error("Error mining:", error)
    } finally {
      setIsMining(false)
    }
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
        <div style={{ position: "relative" }}>
          {/* Частицы */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              style={{
                position: "absolute",
                left: particle.x,
                top: particle.y,
                width: "8px",
                height: "8px",
                backgroundColor: "#4ade80",
                borderRadius: "50%",
                transform: `translate(-50%, -50%)`,
                animation: "particle 1s ease-out forwards",
                zIndex: 3,
              }}
            />
          ))}

          <button
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
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

            {/* Анимация загрузки */}
            {isMining && (
              <div className="mining-animation">
                <svg
                  viewBox="0 0 24 24"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "24px",
                    height: "24px",
                  }}
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2" />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="62.83185307179586"
                    strokeLinecap="round"
                    className="spinner"
                  />
                </svg>
              </div>
            )}

            <span style={{ position: "relative", zIndex: 2, opacity: isMining ? 0 : 1 }}>
              {isMining ? "Майнинг..." : "Майнить ⛏️"}
            </span>
          </button>
        </div>
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

          @keyframes particle {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(
                calc(-50% + ${Math.cos(Math.PI * 2)}px * 50),
                calc(-50% + ${Math.sin(Math.PI * 2)}px * 50)
              ) scale(0);
              opacity: 0;
            }
          }

          .spinner {
            animation: spin 1s linear infinite;
            transform-origin: center;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.2);
          }

          button:not(:disabled):active {
            transform: translateY(0);
          }

          .mining-animation {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(31, 41, 55, 0.9);
            border-radius: 15px;
          }
        `}
      </style>
    </div>
  )
}

export default App

