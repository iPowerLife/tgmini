"use client"

// В начале файла App.jsx добавляем:
import { useEffect, useState } from "react"
import { initTelegram, getTelegramUser } from "./utils/telegram" // Предполагается, что функции находятся здесь
import { supabase } from "./utils/supabaseClient" // Предполагается, что supabase находится здесь

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [miningPower, setMiningPower] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Добавляем обработку ошибок инициализации
  useEffect(() => {
    async function init() {
      try {
        console.log("Starting app initialization...")

        // Инициализируем Telegram
        const tg = initTelegram()
        console.log("Telegram initialization result:", tg)

        const telegramUser = getTelegramUser()
        console.log("Got Telegram user:", telegramUser)

        if (!telegramUser?.id) {
          throw new Error("Не удалось получить ID пользователя Telegram")
        }

        // Получаем или создаем пользователя в базе
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching user:", fetchError)
          throw new Error(`Ошибка получения данных: ${fetchError.message}`)
        }

        if (existingUser) {
          console.log("Found existing user:", existingUser)
          setUser(existingUser)
          setBalance(existingUser.balance)
          setMiningPower(existingUser.mining_power)
        } else {
          console.log("Creating new user for:", telegramUser)
          const { data: newUser, error: createError } = await supabase
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
              },
            ])
            .select()
            .single()

          if (createError) {
            console.error("Error creating user:", createError)
            throw new Error(`Ошибка создания пользователя: ${createError.message}`)
          }

          console.log("Created new user:", newUser)
          setUser(newUser)
        }
      } catch (err) {
        console.error("Error in init:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <p>Balance: {balance}</p>
          <p>Mining Power: {miningPower}</p>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  )
}

export default App

