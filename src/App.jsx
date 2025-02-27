"use client"

// Обновим только функцию loadShopData
import { useState } from "react"

async function loadShopData() {
  const [error, setError] = useState(null)
  const [shopItems, setShopItems] = useState([])
  const [userItems, setUserItems] = useState([])
  const user = { id: 123 } // Пример пользователя, нужно заменить на реальные данные

  const getShopItems = async () => {
    // Заглушка для получения предметов магазина
    return [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]
  }

  const getUserItems = async (userId) => {
    // Заглушка для получения предметов пользователя
    return [{ id: 1, name: "Item 1" }]
  }

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

