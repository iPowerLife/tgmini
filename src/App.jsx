"use client"

import { useState, useEffect, useCallback } from "react"
import { initTelegram } from "./utils/telegram"
import { getShopItems, getUserItems } from "./utils/shop"

// Добавляем export default
export default function App() {
  const [user, setUser] = useState(null)
  const [isMining, setIsMining] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  const [shopItems, setShopItems] = useState([])
  const [userItems, setUserItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const initializeUser = useCallback(async () => {
    // Placeholder for user initialization logic
    // Replace with your actual implementation
    console.log("Initializing user...")
  }, [])

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Initializing app...")
        initTelegram()
        await initializeUser()
      } catch (error) {
        console.error("App initialization error:", error)
        setError(error.message)
      }
    }
    initApp()
  }, [initializeUser])

  async function loadShopData() {
    //   const [error, setError] = useState(null)
    //   const [shopItems, setShopItems] = useState([])
    //   const [userItems, setUserItems] = useState([])
    const user = { id: 123 } // Пример пользователя, нужно заменить на реальные данные

    //   const getShopItems = async () => {
    //     // Заглушка для получения предметов магазина
    //     return [
    //       { id: 1, name: "Item 1" },
    //       { id: 2, name: "Item 2" },
    //     ]
    //   }

    //   const getUserItems = async (userId) => {
    //     // Заглушка для получения предметов пользователя
    //     return [{ id: 1, name: "Item 1" }]
    //   }

    try {
      console.log("Loading shop data...")
      setError(null) // Сбрасываем предыдущие ошибки

      // Загружаем предметы магазина
      const items = await getShopItems()
      console.log("Shop items loaded:", items)

      if (!items || items.length === 0) {
        throw new Error("Предметы магазина не найдены")
      }

      // Загружаем предметы пользователя
      const userOwnedItems = await getUserItems(user.id)
      console.log("User items loaded:", userOwnedItems)

      setShopItems(items)
      setUserItems(userOwnedItems)
    } catch (error) {
      console.error("Error loading shop data:", error)
      setError(error.message)
      setShopItems([])
      setUserItems([])
    }
  }

  // ... остальной код компонента App остается без изменений
}

