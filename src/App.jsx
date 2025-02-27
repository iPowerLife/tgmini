"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { getDailyBonusInfo, claimDailyBonus } from "./utils/daily-bonus"

export default function App() {
  const [userData, setUserData] = useState({
    balance: 0,
    mining_power: 1,
    level: 1,
    experience: 0,
    next_level_exp: 100,
  })
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [bonusInfo, setBonusInfo] = useState(null)
  const [bonusTimeLeft, setBonusTimeLeft] = useState("")
  const [isClaimingBonus, setIsClaimingBonus] = useState(false)
  const [bonusError, setBonusError] = useState(null)
  const [showBonusAnimation, setShowBonusAnimation] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState(null)

  // Инициализация и другие эффекты остаются без изменений...
  useEffect(() => {
    const initialize = async () => {
      await initTelegram()
      const user = getTelegramUser()

      if (user) {
        try {
          const { data, error } = await supabase.from("users").select("*").eq("telegram_id", user.id).single()

          if (error) {
            console.error("Ошибка при запросе данных:", error)
          }

          if (data) {
            setUserData(data)
          } else {
            // Если пользователя нет в базе, создаем его
            const newUser = {
              telegram_id: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
            }

            const { data: newUserData, error: newUserError } = await supabase
              .from("users")
              .insert([newUser])
              .select("*")
              .single()

            if (newUserError) {
              console.error("Ошибка при создании пользователя:", newUserError)
            }

            if (newUserData) {
              setUserData(newUserData)
            }
          }

          // Получаем информацию о ежедневном бонусе
          if (data?.id || (userData && userData.id)) {
            const userId = data?.id || (userData && userData.id)
            const bonusData = await getDailyBonusInfo(userId)
            setBonusInfo(bonusData)
          }
        } catch (error) {
          console.error("Произошла ошибка:", error)
        }
      }
    }

    initialize()
  }, [userData])

  // Функция для запуска майнинга
  const handleMining = async () => {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    setCooldown(60) // 60 секунд кулдаун

    try {
      // Симулируем процесс майнинга
      await new Promise((resolve) => setTimeout(resolve, 5000)) // 5 секунд майнинга

      // Увеличиваем баланс пользователя
      const miningReward = userData.mining_power // Награда равна мощности майнинга
      const newBalance = userData.balance + miningReward

      // Отправляем обновление баланса в Supabase
      const { data, error } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", userData.id)
        .select("*")
        .single()

      if (error) {
        console.error("Ошибка при обновлении баланса:", error)
        // Обработка ошибки обновления баланса
      } else if (data) {
        // Обновляем состояние баланса локально
        setUserData((prev) => ({ ...prev, balance: newBalance }))
      }
    } catch (error) {
      console.error("Ошибка во время майнинга:", error)
      // Обработка ошибок в процессе майнинга
    } finally {
      setIsMining(false)
    }
  }

  // Обновляем состояние кулдауна каждую секунду
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  // Обновляем таймер бонуса
  useEffect(() => {
    if (!bonusInfo?.lastClaim) return

    const updateBonusTimer = () => {
      const now = new Date()
      const lastClaimDate = new Date(bonusInfo.lastClaim)
      const nextClaim = new Date(lastClaimDate)
      nextClaim.setDate(nextClaim.getDate() + 1)
      nextClaim.setHours(0, 0, 0, 0)

      const diff = nextClaim - now
      if (diff <= 0) {
        setBonusTimeLeft("")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setBonusTimeLeft(`${hours}ч ${minutes}м`)
    }

    updateBonusTimer()
    const timer = setInterval(updateBonusTimer, 60000)
    return () => clearInterval(timer)
  }, [bonusInfo?.lastClaim])

  const handleClaimBonus = async () => {
    console.log("handleClaimBonus called", { userId: userData?.id, isClaimingBonus })

    if (!userData?.id || isClaimingBonus) {
      console.log("Early return:", { userId: userData?.id, isClaimingBonus })
      return
    }

    try {
      setIsClaimingBonus(true)
      setBonusError(null)

      console.log("Calling claimDailyBonus...")
      const result = await claimDailyBonus(userData.id)
      console.log("Claim result:", result)

      if (result.success) {
        setUserData(result.user)
        setClaimedBonus(result.bonus)
        setShowBonusAnimation(true)

        // Обновляем информацию о бонусе
        const newBonusInfo = await getDailyBonusInfo(userData.id)
        console.log("Updated bonus info:", newBonusInfo)
        setBonusInfo(newBonusInfo)

        setTimeout(() => {
          setShowBonusAnimation(false)
          setClaimedBonus(null)
        }, 3000)
      } else {
        console.error("Claim failed:", result.error)
        setBonusError(result.error)
        setTimeout(() => setBonusError(null), 3000)
      }
    } catch (error) {
      console.error("Error in handleClaimBonus:", error)
      setBonusError(error.message)
      setTimeout(() => setBonusError(null), 3000)
    } finally {
      setIsClaimingBonus(false)
    }
  }

  // handleMining остается без изменений...

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
            <span style={{ color: "#4ade80" }}>{userData.balance.toFixed(2)} 💎</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Мощность:</span>
            <span style={{ color: "#60a5fa" }}>{userData.mining_power.toFixed(1)} ⚡</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Уровень:</span>
            <span style={{ color: "#fbbf24" }}>{userData.level} ✨</span>
          </div>
        </div>

        {/* Секция ежедневного бонуса */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Ежедневный бонус:</span>
              {bonusInfo?.streak > 0 && <span style={{ color: "#fbbf24" }}>Серия: {bonusInfo.streak} 🔥</span>}
            </div>
          </div>

          {showBonusAnimation && claimedBonus ? (
            <div
              style={{
                textAlign: "center",
                color: "#4ade80",
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "5px" }}>+{claimedBonus.amount} 💎</div>
              <div>{claimedBonus.type === "weekend" ? "Выходной x2!" : `Серия: ${claimedBonus.streak} 🔥`}</div>
            </div>
          ) : (
            <button
              onClick={handleClaimBonus}
              disabled={isClaimingBonus || !!bonusTimeLeft}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isClaimingBonus || bonusTimeLeft ? "#1f2937" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isClaimingBonus || bonusTimeLeft ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.2s ease",
              }}
            >
              {isClaimingBonus
                ? "Получение бонуса..."
                : bonusTimeLeft
                  ? `Следующий бонус через: ${bonusTimeLeft}`
                  : "Получить ежедневный бонус 🎁"}
            </button>
          )}

          {bonusError && (
            <div
              style={{
                marginTop: "10px",
                color: "#ff4444",
                fontSize: "14px",
                textAlign: "center",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              {bonusError}
            </div>
          )}
        </div>

        {/* Кнопка майнинга */}
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
          {isMining ? "Майнинг..." : cooldown > 0 ? `Перезарядка (${cooldown}с)` : "Майнить ⛏️"}

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
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  )
}

