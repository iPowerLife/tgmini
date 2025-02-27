"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"

// Добавьте импорт компонента и функций
import { DailyBonus } from "./components/DailyBonus"
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

  // В компоненте App добавьте новое состояние
  const [showDailyBonus, setShowDailyBonus] = useState(false)
  const [bonusInfo, setBonusInfo] = useState(null)

  // Инициализация приложения
  useEffect(() => {
    const init = async () => {
      try {
        // Инициализируем Telegram WebApp
        const tg = initTelegram()
        if (!tg) return

        // Получаем данные пользователя
        const telegramUser = getTelegramUser()
        if (!telegramUser) return

        // Загружаем данные из базы
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (existingUser) {
          setUserData(existingUser)
          return
        }

        // Создаем нового пользователя
        const { data: newUser } = await supabase
          .from("users")
          .insert([
            {
              telegram_id: telegramUser.id,
              username: telegramUser.username,
              balance: 0,
              mining_power: 1,
              level: 1,
              experience: 0,
              next_level_exp: 100,
              last_mining: new Date().toISOString(),
            },
          ])
          .select()
          .single()

        if (newUser) setUserData(newUser)
      } catch (error) {
        console.error("Initialization error:", error)
      }
    }

    init()
  }, [])

  // Добавьте эффект для проверки бонуса
  useEffect(() => {
    const checkBonus = async () => {
      if (userData?.id) {
        const info = await getDailyBonusInfo(userData.id)
        setBonusInfo(info)
      }
    }

    checkBonus()
  }, [userData?.id])

  // Добавьте функцию для получения бонуса
  const handleClaimBonus = async (amount) => {
    if (!userData?.id) return

    const result = await claimDailyBonus(userData.id, amount)
    if (result.success) {
      setUserData(result.user)
      setBonusInfo({
        ...bonusInfo,
        canClaim: false,
        lastClaim: new Date().toISOString(),
        streak: (bonusInfo?.streak || 0) + 1,
      })
      setShowDailyBonus(false)
    }
  }

  const handleMining = async () => {
    if (isMining || cooldown > 0) return

    try {
      setIsMining(true)

      const { data } = await supabase
        .from("users")
        .update({
          balance: userData.balance + userData.mining_power,
          last_mining: new Date().toISOString(),
        })
        .eq("id", userData.id)
        .select()
        .single()

      if (data) {
        setUserData(data)
        setCooldown(60)

        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      console.error("Mining error:", error)
    } finally {
      setIsMining(false)
    }
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
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            display: "grid",
            gap: "10px",
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
            <span style={{ color: "#4ade80" }}>{userData.balance.toFixed(2)} 💎</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Мощность:</span>
            <span style={{ color: "#60a5fa" }}>{userData.mining_power.toFixed(1)} ⚡</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Уровень:</span>
            <span style={{ color: "#fbbf24" }}>{userData.level} ✨</span>
          </div>
        </div>

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
            transition: "background-color 0.2s",
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

        <button
          onClick={() => setShowDailyBonus(true)}
          style={{
            padding: "10px",
            backgroundColor: bonusInfo?.canClaim ? "#4ade80" : "#1f2937",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: bonusInfo?.canClaim ? "pointer" : "not-allowed",
            fontSize: "14px",
          }}
        >
          Ежедневный бонус 🎁
        </button>

        {showDailyBonus && (
          <DailyBonus
            onClose={() => setShowDailyBonus(false)}
            onClaim={handleClaimBonus}
            lastClaim={bonusInfo?.lastClaim}
            streak={bonusInfo?.streak || 0}
          />
        )}
      </div>
    </div>
  )
}

