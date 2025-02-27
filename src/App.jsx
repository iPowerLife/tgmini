"use client"

import { useState, useEffect, useCallback } from "react"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { getUser, createUser } from "./utils/database"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"
import { Shop } from "./components/Shop"
import { Achievements } from "./components/Achievements"
import { DebugPanel } from "./components/DebugPanel"
import { getShopItems, getUserItems, purchaseItem } from "./utils/shop"
import { getAchievements } from "./utils/achievements"

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [shopItems, setShopItems] = useState([])
  const [userItems, setUserItems] = useState([])
  const [achievements, setAchievements] = useState([])

  // Инициализация пользователя
  const initializeUser = useCallback(async () => {
    try {
      console.log("Initializing user...")
      const telegramUser = getTelegramUser()
      console.log("Telegram user:", telegramUser)

      if (!telegramUser) {
        throw new Error("Не удалось получить данные пользователя Telegram")
      }

      let userData = await getUser(telegramUser.id)
      console.log("Existing user data:", userData)

      if (!userData) {
        console.log("Creating new user...")
        userData = await createUser(telegramUser.id, telegramUser.username)
        console.log("New user created:", userData)
      }

      setUser(userData)
      return userData
    } catch (error) {
      console.error("User initialization error:", error)
      setError(error.message)
      return null
    }
  }, [])

  // Загрузка данных магазина
  const loadShopData = useCallback(async (userId) => {
    try {
      console.log("Loading shop data for user:", userId)
      const items = await getShopItems()
      const userOwnedItems = await getUserItems(userId)
      setShopItems(items)
      setUserItems(userOwnedItems)
    } catch (error) {
      console.error("Shop data loading error:", error)
      setError(error.message)
    }
  }, [])

  // Загрузка достижений
  const loadAchievements = useCallback(async (userId) => {
    try {
      console.log("Loading achievements for user:", userId)
      const userAchievements = await getAchievements(userId)
      setAchievements(userAchievements)
    } catch (error) {
      console.error("Achievements loading error:", error)
      setError(error.message)
    }
  }, [])

  // Инициализация приложения
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Initializing app...")
        setIsLoading(true)
        setError(null)

        // Инициализируем Telegram WebApp
        const tgInitialized = initTelegram()
        console.log("Telegram WebApp initialized:", tgInitialized)

        // Инициализируем пользователя
        const userData = await initializeUser()
        if (!userData) {
          throw new Error("Не удалось инициализировать пользователя")
        }

        // Загружаем данные магазина и достижений
        await Promise.all([loadShopData(userData.id), loadAchievements(userData.id)])

        setIsLoading(false)
      } catch (error) {
        console.error("App initialization error:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    initApp()
  }, [initializeUser, loadShopData, loadAchievements])

  // Обработчик майнинга
  const handleMine = async () => {
    if (isMining || cooldown > 0) return

    try {
      setIsMining(true)
      // Здесь будет логика майнинга
      setIsMining(false)
      setCooldown(60) // 60 секунд кулдаун
    } catch (error) {
      console.error("Mining error:", error)
      setError(error.message)
      setIsMining(false)
    }
  }

  // Если идет загрузка, показываем индикатор
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1a1b1e",
          color: "white",
        }}
      >
        <div style={{ marginBottom: "20px" }}>Загрузка игры...</div>
        <div style={{ fontSize: "14px", color: "#666" }}>Подключение к Telegram WebApp...</div>
      </div>
    )
  }

  // Если есть ошибка, показываем её
  if (error) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1a1b1e",
          color: "white",
        }}
      >
        <div style={{ color: "#ff4444", marginBottom: "20px" }}>Произошла ошибка: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Перезагрузить
        </button>
      </div>
    )
  }

  // Основной интерфейс
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        background: "#1a1b1e",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {user && (
        <>
          <Stats
            balance={user.balance}
            miningPower={user.mining_power}
            level={user.level}
            experience={user.experience}
            nextLevelExp={user.next_level_exp}
          />

          <MiningButton onMine={handleMine} cooldown={cooldown} isCooldown={cooldown > 0} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => setShowShop(true)}
              style={{
                padding: "15px",
                background: "#2563eb",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Магазин 🏪
            </button>

            <button
              onClick={() => setShowAchievements(true)}
              style={{
                padding: "15px",
                background: "#2563eb",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Достижения 🏆
            </button>
          </div>

          {showShop && (
            <Shop
              items={shopItems}
              userItems={userItems}
              balance={user.balance}
              onPurchase={async (item) => {
                try {
                  await purchaseItem(user.id, item.id)
                  await loadShopData(user.id)
                  await initializeUser() // Обновляем данные пользователя
                } catch (error) {
                  setError(error.message)
                }
              }}
              onClose={() => setShowShop(false)}
            />
          )}

          {showAchievements && <Achievements achievements={achievements} onClose={() => setShowAchievements(false)} />}
        </>
      )}

      {/* Отладочная панель в режиме разработки */}
      {import.meta.env.DEV && (
        <DebugPanel
          onTest={async () => {
            try {
              await initializeUser()
              console.log("Debug test completed")
            } catch (error) {
              console.error("Debug test error:", error)
            }
          }}
        />
      )}
    </div>
  )
}

