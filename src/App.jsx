"use client"

import { useState, useEffect } from "react"
import { testSupabaseConnection } from "./supabase"
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
  const [error, setError] = useState(null)

  // Инициализация и проверка подключения
  useEffect(() => {
    async function init() {
      try {
        console.log("Initializing app...")
        initTelegram()

        // Проверяем подключение к Supabase
        const isConnected = await testSupabaseConnection()
        if (!isConnected) {
          throw new Error("Failed to connect to Supabase")
        }

        await initializeUser()
      } catch (error) {
        console.error("Initialization error:", error)
        setError(error.message)
      }
    }
    init()
  }, [])

  // Загрузка достижений и предметов магазина
  useEffect(() => {
    if (user) {
      console.log("Loading user data...", { userId: user.id })
      loadUserData()
    }
  }, [user])

  async function loadUserData() {
    try {
      console.log("Loading achievements and shop items...")

      // Загружаем достижения
      const userAchievements = await getAchievements(user.id)
      console.log("Loaded achievements:", userAchievements)
      setAchievements(userAchievements)

      // Загружаем предметы магазина
      const items = await getShopItems()
      console.log("Loaded shop items:", items)
      const userOwnedItems = await getUserItems(user.id)
      console.log("Loaded user items:", userOwnedItems)

      setShopItems(items)
      setUserItems(userOwnedItems)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading user data:", error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  async function initializeUser() {
    try {
      const telegramUser = getTelegramUser()
      if (!telegramUser) {
        throw new Error("Не удалось получить данные пользователя Telegram")
      }

      console.log("Telegram user:", telegramUser)

      let userData = await getUser(telegramUser.id)
      if (!userData) {
        console.log("Creating new user...")
        userData = await createUser(telegramUser.id, telegramUser.username)
      }

      console.log("User data:", userData)
      setUser(userData)
    } catch (error) {
      console.error("Error initializing user:", error)
      setError(error.message)
    }
  }

  async function handleMining() {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    try {
      console.log("Mining started...")

      // Начисляем монеты
      const updatedUser = await updateUser(user.id, {
        balance: user.balance + user.mining_power,
        last_mining: new Date().toISOString(),
      })

      console.log("Mining completed:", updatedUser)

      // Проверяем достижения
      await checkAchievements(user.id, updatedUser)

      // Обновляем данные
      setUser(updatedUser)
      await loadUserData() // Перезагружаем достижения после майнинга

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
      console.error("Mining error:", error)
      setError(error.message)
    } finally {
      setIsMining(false)
    }
  }

  async function handlePurchase(item) {
    try {
      console.log("Attempting purchase:", item)

      const updatedUser = await purchaseItem(user.id, item, user.balance)
      console.log("Purchase completed:", updatedUser)

      setUser(updatedUser)
      await loadUserData() // Перезагружаем предметы после покупки
    } catch (error) {
      console.error("Purchase error:", error)
      alert(error.message)
    }
  }

  if (error) {
    return <div style={{ padding: 20, textAlign: "center", color: "red" }}>Ошибка: {error}</div>
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
          onClick={() => {
            console.log("Opening achievements:", achievements)
            setShowAchievements(true)
          }}
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
          onClick={() => {
            console.log("Opening shop:", { items: shopItems, userItems })
            setShowShop(true)
          }}
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

