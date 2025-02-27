"use client"

import { useState, useEffect } from "react"

export default function DailyBonus({ onClose, onClaim, lastClaim, streak = 0, isWeekend = false }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [showAnimation, setShowAnimation] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState(null)

  const calculateBaseBonus = () => {
    const baseAmount = 100
    let totalBonus = baseAmount

    // Увеличиваем бонус за серию (10% за каждый день)
    if (streak > 1) {
      totalBonus *= 1 + (streak - 1) * 0.1
    }

    // Удваиваем в выходные
    if (isWeekend) {
      totalBonus *= 2
    }

    return Math.floor(totalBonus)
  }

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await onClaim()
      console.log("Claim result:", result)

      if (!result) {
        throw new Error("Не удалось получить бонус")
      }

      if (!result.success) {
        throw new Error(result.error || "Ошибка получения бонуса")
      }

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
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
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
          {/* Информация о серии */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontSize: "18px", marginBottom: "5px" }}>
              Текущая серия: {streak} {streak > 0 && "🔥"}
            </div>
            <div style={{ color: "#888", fontSize: "14px" }}>
              {streak === 0
                ? "Начните собирать ежедневные бонусы!"
                : `Вы собираете бонусы ${streak} ${streak === 1 ? "день" : "дня"} подряд`}
            </div>
          </div>

          {/* Информация о бонусе */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ color: "#4ade80", marginBottom: "5px" }}>Базовый бонус: 100 💎</div>

            {/* Множитель за серию */}
            {streak > 1 && (
              <div style={{ color: "#60a5fa", fontSize: "14px", marginBottom: "5px" }}>
                {streak <= 7
                  ? `+${(streak - 1) * 15}% за серию (${streak}/7 дней)`
                  : streak <= 14
                    ? `+${100 + (streak - 7) * 20}% за серию (${streak}/14 дней)`
                    : streak <= 30
                      ? `+${240 + (streak - 14) * 25}% за серию (${streak}/30 дней)`
                      : `+${740 + (streak - 30) * 10}% за серию`}
              </div>
            )}

            {/* Информация о следующей награде */}
            <div style={{ color: "#fbbf24", fontSize: "14px", marginBottom: "5px" }}>
              {streak < 7
                ? `До награды за неделю: ${7 - streak} дней (1000 💎)`
                : streak < 14
                  ? `До награды за 2 недели: ${14 - streak} дней (2500 💎)`
                  : streak < 30
                    ? `До награды за месяц: ${30 - streak} дней (7500 💎)`
                    : streak < 100
                      ? `До награды за 100 дней: ${100 - streak} дней (25000 💎)`
                      : streak < 365
                        ? `До награды за год: ${365 - streak} дней (100000 💎)`
                        : "Максимальная серия! 🏆"}
            </div>

            {/* Бонус за выходные */}
            {isWeekend && (
              <div style={{ color: "#fbbf24", fontSize: "14px", marginBottom: "5px" }}>x2 бонус в выходные! 🎉</div>
            )}

            {/* Специальный бонус */}
            {claimedBonus?.specialBonus && (
              <div
                style={{
                  color: "#f472b6",
                  fontSize: "16px",
                  marginTop: "10px",
                  padding: "8px",
                  background: "rgba(244, 114, 182, 0.1)",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                {claimedBonus.specialBonusDescription}
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                marginTop: "10px",
                paddingTop: "10px",
                fontSize: "18px",
                color: "#4ade80",
              }}
            >
              Итого: {calculateBaseBonus()} 💎
            </div>
          </div>

          {timeLeft && (
            <div style={{ color: "#888", fontSize: "14px", textAlign: "center" }}>До следующего бонуса: {timeLeft}</div>
          )}
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
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isLoading ? "Получение бонуса..." : timeLeft ? `Следующий бонус через: ${timeLeft}` : "Получить бонус"}

          {timeLeft && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "4px",
                backgroundColor: "#3b82f6",
                width: "100%",
                transform: `scaleX(${timeLeft ? 1 : 0})`,
                transformOrigin: "left",
                transition: "transform 1s linear",
              }}
            />
          )}
        </button>

        {error && (
          <div
            style={{
              marginTop: "10px",
              color: "#ff4444",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

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
            <div style={{ color: "#4ade80", marginBottom: "5px" }}>
              {claimedBonus.type === "weekend" ? "Выходной x2!" : `Серия: ${claimedBonus.streak} 🔥`}
            </div>
            {claimedBonus.specialBonus && (
              <div style={{ color: "#f472b6", marginTop: "5px" }}>{claimedBonus.specialBonusDescription}</div>
            )}
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

