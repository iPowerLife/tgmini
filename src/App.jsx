"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { getDailyBonusInfo, claimDailyBonus } from "./utils/daily-bonus"
import DailyBonus from "./components/DailyBonus"

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
  const [bonusInfo, setBonusInfo] = useState({
    canClaim: true,
    lastClaim: null,
    streak: 0,
    nextBonus: null,
    isWeekend: false,
  })
  const [bonusTimeLeft, setBonusTimeLeft] = useState("")
  const [isClaimingBonus, setIsClaimingBonus] = useState(false)
  const [bonusError, setBonusError] = useState(null)
  const [showBonusAnimation, setShowBonusAnimation] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState(null)
  const [showBonusModal, setShowBonusModal] = useState(false)

  // Инициализация и другие эффекты остаются без изменений...
  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing app...")
      await initTelegram()
      const telegramUser = getTelegramUser()

      if (telegramUser) {
        try {
          console.log("Telegram user:", telegramUser)

          // Сначала пытаемся получить существующего пользователя
          let user = await getUser(telegramUser.id)

          // Если пользователь не найден, создаем нового
          if (!user) {
            console.log("User not found, creating new user...")
            try {
              user = await createUser(telegramUser.id, telegramUser.username)
              console.log("New user created:", user)
            } catch (createError) {
              console.error("Error creating user:", createError)
              return
            }
          }

          // Устанавливаем данные пользователя
          setUserData(user)

          // Получаем информацию о бонусе
          try {
            const bonusData = await getDailyBonusInfo(user.id)
            console.log("Bonus info loaded:", bonusData)
            setBonusInfo(bonusData)
          } catch (bonusError) {
            console.error("Error loading bonus info:", bonusError)
          }
        } catch (error) {
          console.error("Error in initialization:", error)
        }
      } else {
        console.error("No Telegram user data available")
      }
    }

    initialize()
  }, [])

  const handleMining = async () => {
    if (isMining || cooldown > 0 || !userData?.id) return

    setIsMining(true)
    setCooldown(60)

    try {
      // Симулируем процесс майнинга
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const miningReward = userData.mining_power

      // Обновляем баланс через функцию updateUserBalance
      const updatedUser = await updateUserBalance(userData.id, miningReward, userData)

      if (updatedUser) {
        setUserData(updatedUser)

        // Логируем транзакцию
        await logTransaction(userData.id, miningReward, "mining", "Майнинг криптовалюты")
      }
    } catch (error) {
      console.error("Error during mining:", error)
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
    console.log("handleClaimBonus called", {
      userId: userData?.id,
      isClaimingBonus,
      bonusInfo,
    })

    if (!userData?.id || isClaimingBonus) {
      console.log("Early return:", {
        userId: userData?.id,
        isClaimingBonus,
        reason: !userData?.id ? "no userId" : "already claiming",
      })
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
          <button
            onClick={() => setShowBonusModal(true)}
            disabled={isClaimingBonus}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isClaimingBonus ? "#1f2937" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isClaimingBonus ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span>Ежедневный бонус</span>
            {bonusInfo?.streak > 0 && <span style={{ color: "#fbbf24" }}>🔥 {bonusInfo.streak}</span>}
          </button>
        </div>

        {/* Модальное окно бонуса */}
        {showBonusModal && (
          <DailyBonus
            onClose={() => setShowBonusModal(false)}
            onClaim={handleClaimBonus}
            lastClaim={bonusInfo.lastClaim}
            streak={bonusInfo.streak}
            isWeekend={bonusInfo.isWeekend}
          />
        )}

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

async function getUser(telegramId) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUser function:", error)
    return null
  }
}

async function createUser(telegramId, username) {
  try {
    const newUser = {
      telegram_id: telegramId,
      username: username,
    }

    const { data, error } = await supabase.from("users").insert([newUser]).select("*").single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createUser function:", error)
    return null
  }
}

async function updateUserBalance(userId, amount, userData) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ balance: userData.balance + amount })
      .eq("id", userId)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating user balance:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateUserBalance function:", error)
    return null
  }
}

async function logTransaction(userId, amount, type, description) {
  try {
    const newTransaction = {
      user_id: userId,
      amount: amount,
      type: type,
      description: description,
    }

    const { data, error } = await supabase.from("transactions").insert([newTransaction]).select("*").single()

    if (error) {
      console.error("Error logging transaction:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in logTransaction function:", error)
    return null
  }
}

