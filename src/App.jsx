"use client"

import { useState, useEffect } from "react"
import { getTelegramUser, initTelegram } from "./utils/telegram"
import { getUser, createUser, updateUser } from "./utils/database"
import { getAchievements, checkAchievements } from "./utils/achievements"
import { getShopItems, getUserItems, purchaseItem } from "./utils/shop"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"
import { Shop } from "./components/Shop"
import { Achievements } from "./components/Achievements"

export default function App() {
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [shopItems, setShopItems] = useState([])
  const [userItems, setUserItems] = useState([])
  const [achievements, setAchievements] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Инициализация
  useEffect(() => {
    initTelegram()
    initializeUser()
  }, [])

  // Загрузка достижений
  useEffect(() => {
    if (user) {
      loadAchievements()
    }
  }, [user])

  // Загрузка предметов магазина
  useEffect(() => {
    if (user) {
      loadShopItems()
    }
  }, [user])

  async function initializeUser() {
    try {
      const telegramUser = getTelegramUser()
      if (!telegramUser) {
        console.error("Не удалось получить данные пользователя Telegram")
        return
      }

      let userData = await getUser(telegramUser.id)
      if (!userData) {
        userData = await createUser(telegramUser.id, telegramUser.username)
      }

      setUser(userData)
      setIsLoading(false)
    } catch (error) {
      console.error("Ошибка инициализации:", error)
    }
  }

  async function loadAchievements() {
    try {
      console.log("Loading achievements for user:", user.id)
      const userAchievements = await getAchievements(user.id)
      console.log("Loaded achievements:", userAchievements)
      setAchievements(userAchievements)
    } catch (error) {
      console.error("Ошибка загрузки достижений:", error)
    }
  }

  async function loadShopItems() {
    try {
      const items = await getShopItems()
      const userOwnedItems = await getUserItems(user.id)
      setShopItems(items)
      setUserItems(userOwnedItems)
    } catch (error) {
      console.error("Ошибка загрузки предметов магазина:", error)
    }
  }

  async function handleMining() {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    try {
      // Начисляем монеты
      const updatedUser = await updateUser(user.id, {
        balance: user.balance + user.mining_power,
        last_mining: new Date().toISOString(),
      })

      // Проверяем достижения
      await checkAchievements(user.id, updatedUser)

      // Обновляем данные
      setUser(updatedUser)
      await loadAchievements()

      // Запускаем таймер перезарядки
      setCooldown(3)
      const timer = setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            clearInterval(timer)
            return 0
          }
          return current - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Ошибка майнинга:", error)
    } finally {
      setIsMining(false)
    }
  }

  async function handlePurchase(item) {
    try {
      const updatedUser = await purchaseItem(user.id, item, user.balance)
      setUser(updatedUser)
      await loadShopItems()
    } catch (error) {
      console.error("Ошибка покупки:", error)
      alert(error.message)
    }
  }

  if (isLoading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Загрузка...</div>
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <Stats
        balance={user.balance}
        miningPower={user.mining_power}
        level={user.level}
        experience={user.experience}
        nextLevelExp={user.next_level_exp}
      />

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <MiningButton onMine={handleMining} cooldown={cooldown} isCooldown={cooldown > 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          onClick={() => setShowAchievements(true)}
          style={{
            padding: 15,
            fontSize: 16,
            color: "white",
            background: "#3b82f6",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Достижения 🏆
        </button>
        <button
          onClick={() => setShowShop(true)}
          style={{
            padding: 15,
            fontSize: 16,
            color: "white",
            background: "#3b82f6",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Магазин 🏪
        </button>
      </div>

      {showAchievements && <Achievements achievements={achievements} onClose={() => setShowAchievements(false)} />}

      {showShop && (
        <Shop
          items={shopItems}
          userItems={userItems}
          balance={user.balance}
          onPurchase={handlePurchase}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  )
}

