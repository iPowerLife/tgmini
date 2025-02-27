"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { getDailyBonusInfo, claimDailyBonus } from "./utils/daily-bonus"
import { LoadingScreen } from "./components/LoadingScreen"
import { DebugPanel } from "./components/DebugPanel"
import DailyBonus from "./components/DailyBonus"

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState({
    id: null,
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
  const [showBonusModal, setShowBonusModal] = useState(false)
  const [isClaimingBonus, setIsClaimingBonus] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Initializing app...")
        await initTelegram()
        const telegramUser = getTelegramUser()

        if (!telegramUser) {
          throw new Error("No Telegram user data available")
        }

        console.log("Telegram user:", telegramUser)

        // Получаем или создаем пользователя
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          throw userError
        }

        let user = existingUser

        if (!user) {
          console.log("Creating new user...")
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username,
              },
            ])
            .select()
            .single()

          if (createError) throw createError
          user = newUser
        }

        console.log("User data:", user)
        setUserData(user)

        // Получаем информацию о бонусе
        const bonusData = await getDailyBonusInfo(user.id)
        console.log("Bonus info:", bonusData)
        setBonusInfo(bonusData)

        setIsLoading(false)
      } catch (error) {
        console.error("Initialization error:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  const handleMining = async () => {
    if (isMining || cooldown > 0 || !userData?.id) return

    setIsMining(true)
    setCooldown(60)

    try {
      const miningReward = userData.mining_power

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({ balance: userData.balance + miningReward })
        .eq("id", userData.id)
        .select()
        .single()

      if (error) throw error

      setUserData(updatedUser)

      // Логируем транзакцию
      await supabase.from("transactions").insert([
        {
          user_id: userData.id,
          amount: miningReward,
          type: "mining",
          description: "Майнинг криптовалюты",
        },
      ])
    } catch (error) {
      console.error("Mining error:", error)
    } finally {
      setIsMining(false)
    }
  }

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  const handleClaimBonus = async () => {
    if (!userData?.id || isClaimingBonus) return

    try {
      setIsClaimingBonus(true)
      console.log("Claiming bonus for user:", userData.id)

      const result = await claimDailyBonus(userData.id)
      console.log("Claim result:", result)

      if (!result.success) {
        alert(result.error)
        return
      }

      // Обновляем данные пользователя
      setUserData((prev) => ({
        ...prev,
        balance: result.user.balance,
      }))

      // Обновляем информацию о бонусе
      const newBonusInfo = await getDailyBonusInfo(userData.id)
      setBonusInfo(newBonusInfo)

      setShowBonusModal(false)
    } catch (error) {
      console.error("Error claiming bonus:", error)
      alert("Произошла ошибка при получении бонуса")
    } finally {
      setIsClaimingBonus(false)
    }
  }

  if (isLoading || error) {
    return <LoadingScreen message={isLoading ? "Загрузка..." : undefined} error={error} />
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

        <DebugPanel
          userId={userData.id}
          onTestBonus={async () => {
            try {
              const result = await claimDailyBonus(userData.id)
              console.log("Test bonus result:", result)
              alert(JSON.stringify(result, null, 2))
            } catch (error) {
              console.error("Test bonus error:", error)
              alert("Error: " + error.message)
            }
          }}
        />
      </div>
    </div>
  )
}

