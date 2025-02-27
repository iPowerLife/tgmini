"use client"

import { useState, useEffect } from "react"
import { getTelegramUser, initTelegram } from "./utils/telegram"
import { getUser, createUser, updateUser } from "./utils/database"
import { getShopItems, getUserItems, purchaseItem } from "./utils/shop"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"
import { Shop } from "./components/Shop"

export default function App() {
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  const [shopItems, setShopItems] = useState([])
  const [userItems, setUserItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("App mounted")
    initTelegram()
    initializeUser()
  }, [])

  useEffect(() => {
    if (user) {
      console.log("User loaded, fetching shop data...")
      loadShopData()
    }
  }, [user])

  async function initializeUser() {
    try {
      console.log("Initializing user...")
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

      console.log("User data loaded:", userData)
      setUser(userData)
      setIsLoading(false)
    } catch (error) {
      console.error("Error initializing user:", error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  async function loadShopData() {
    try {
      console.log("Loading shop data...")

      // Загружаем предметы магазина
      const items = await getShopItems()
      console.log("Shop items loaded:", items)

      if (!items || items.length === 0) {
        console.warn("No shop items found!")
      }

      // Загружаем предметы пользователя
      const userOwnedItems = await getUserItems(user.id)
      console.log("User items loaded:", userOwnedItems)

      setShopItems(items)
      setUserItems(userOwnedItems)
    } catch (error) {
      console.error("Error loading shop data:", error)
      setError("Ошибка загрузки магазина: " + error.message)
    }
  }

  async function handleMining() {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    try {
      const updatedUser = await updateUser(user.id, {
        balance: user.balance + user.mining_power,
        last_mining: new Date().toISOString(),
      })
      setUser(updatedUser)

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
      console.log("Attempting to purchase item:", item)
      const updatedUser = await purchaseItem(user.id, item, user.balance)
      console.log("Purchase successful, updated user:", updatedUser)

      setUser(updatedUser)
      await loadShopData() // Перезагружаем данные магазина
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <button
          onClick={() => {
            console.log("Opening shop with items:", shopItems)
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

