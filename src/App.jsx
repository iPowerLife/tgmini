"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"
import { Shop } from "./components/Shop"
import { Achievements } from "./components/Achievements"
import DailyBonus from "./components/DailyBonus"

export default function App() {
  const [userData, setUserData] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [bonusInfo, setBonusInfo] = useState(null)

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
        if (!telegramUser?.id) return

        const { data: user } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

        if (user) {
          setUserData(user)
          // Проверяем доступность бонуса
          const { data: lastBonus } = await supabase
            .from("daily_bonuses")
            .select("*")
            .eq("user_id", user.id)
            .order("claimed_at", { ascending: false })
            .limit(1)
            .single()

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const canClaim = !lastBonus || new Date(lastBonus.claimed_at) < today

          setBonusInfo({
            canClaim,
            lastClaim: lastBonus?.claimed_at || null,
            streak: lastBonus?.streak || 0,
          })
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      }
    }

    loadUserData()
  }, [])

  // Функция майнинга
  const handleMining = async () => {
    if (isMining || cooldown > 0 || !userData) return

    setIsMining(true)
    setCooldown(60)

    try {
      const miningReward = userData.mining_power
      const newBalance = userData.balance + miningReward

      // Обновляем локальное состояние
      setUserData((prev) => ({
        ...prev,
        balance: newBalance,
      }))

      // Обновляем в базе
      await supabase.from("users").update({ balance: newBalance }).eq("id", userData.id)

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
      console.error("Ошибка майнинга:", error)
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

  if (!userData) {
    return null // Ничего не показываем до загрузки данных
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
        <Stats
          balance={userData.balance}
          miningPower={userData.mining_power}
          level={userData.level}
          experience={userData.experience}
          nextLevelExp={userData.next_level_exp}
        />

        {/* Кнопки действий */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setShowShop(true)}
            style={{
              padding: "15px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Магазин 🏪
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            style={{
              padding: "15px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Достижения 🏆
          </button>
        </div>

        {/* Кнопка ежедневного бонуса */}
        {bonusInfo?.canClaim && (
          <button
            onClick={() => setShowBonus(true)}
            style={{
              padding: "15px",
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Получить ежедневный бонус 🎁
          </button>
        )}

        {/* Кнопка майнинга */}
        <MiningButton onMine={handleMining} cooldown={cooldown} isCooldown={cooldown > 0} />

        {/* Модальные окна */}
        {showShop && <Shop onClose={() => setShowShop(false)} userId={userData.id} />}
        {showAchievements && <Achievements onClose={() => setShowAchievements(false)} userId={userData.id} />}
        {showBonus && (
          <DailyBonus
            onClose={() => setShowBonus(false)}
            userId={userData.id}
            streak={bonusInfo?.streak || 0}
            lastClaim={bonusInfo?.lastClaim}
          />
        )}
      </div>
    </div>
  )
}

