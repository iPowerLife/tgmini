"use client"

import { useState, useEffect } from "react"
import { initTelegram, getTelegramUser } from "./utils/telegram"
import { supabase } from "./supabase"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"

function App() {
  const [tg, setTg] = useState(window.Telegram?.WebApp)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [activeSection, setActiveSection] = useState("home")
  const [showIncrease, setShowIncrease] = useState(false)

  useEffect(() => {
    const initTelegramAndUser = async () => {
      try {
        // Инициализируем Telegram WebApp
        const telegram = initTelegram()
        console.log("Telegram initialized:", telegram)
        setTg(telegram)

        // Получаем пользователя Telegram
        const telegramUser = getTelegramUser()
        console.log("Got Telegram user:", telegramUser)

        if (!telegramUser?.id) {
          console.error("No valid user data received")
          throw new Error("No valid user data")
        }

        // Ищем пользователя в базе
        const { data: users, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)

        if (selectError) {
          console.error("Error selecting user:", selectError)
          throw selectError
        }

        console.log("Database query result:", users)
        let user = users?.[0]

        // Если пользователя нет, создаем
        if (!user) {
          console.log("Creating new user with data:", telegramUser)

          // Создаем пользователя с данными из Telegram
          const { data: newUsers, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username || null,
                first_name: telegramUser.first_name || "",
                balance: 0,
                mining_power: 1,
                level: 1,
                experience: 0,
                next_level_exp: 100,
              },
            ])
            .select()

          if (createError) {
            console.error("Error creating user:", createError)
            throw createError
          }

          console.log("Created new user:", newUsers)
          user = newUsers[0]

          // Создаем запись в mining_stats
          const { error: statsError } = await supabase.from("mining_stats").insert([
            {
              user_id: user.id,
              total_mined: 0,
              mining_count: 0,
            },
          ])

          if (statsError) {
            console.error("Error creating mining stats:", statsError)
            throw statsError
          }
        }

        // Обновляем данные пользователя из Telegram
        const { error: updateError } = await supabase
          .from("users")
          .update({
            username: telegramUser.username,
            first_name: telegramUser.first_name,
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("Error updating user data:", updateError)
        }

        // Добавляем данные из Telegram к объекту пользователя
        user = {
          ...user,
          photo_url: telegramUser.photo_url,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
        }

        console.log("Setting user state:", user)
        setUser(user)
        setBalance(user.balance)
      } catch (error) {
        console.error("Error in initialization:", error)
        // Больше не создаем тестового пользователя, вместо этого показываем ошибку
        alert("Ошибка получения данных пользователя")
      }
    }

    initTelegramAndUser()
  }, [])

  const renderContent = () => {
    console.log("Rendering content. User:", user, "Active section:", activeSection)

    if (!user) {
      return <div className="section-container">Загрузка данных пользователя...</div>
    }

    switch (activeSection) {
      case "home":
        return (
          <>
            <div className="balance-card">
              <div className="balance-background" />
              <div className="balance-content">
                <div className="balance-label">Баланс</div>
                <div className="balance-amount">
                  <span>
                    {balance.toFixed(2)}
                    {showIncrease && <span className="balance-increase">+1</span>}
                  </span>
                  <span className="balance-currency">💎</span>
                </div>
              </div>
            </div>

            <MinersList user={user} />
          </>
        )
      case "shop":
        return <Shop user={user} onPurchase={(newBalance) => setBalance(newBalance)} />
      case "tasks":
        return <div className="section-container">Раздел заданий в разработке</div>
      case "rating":
        return <div className="section-container">Раздел рейтинга в разработке</div>
      case "profile":
        return <UserProfile user={user} />
      default:
        return <div className="section-container">Выберите раздел</div>
    }
  }

  return (
    <div className="app-wrapper">
      <div className="background-gradient" />
      <div className="decorative-circle-1" />
      <div className="decorative-circle-2" />

      <div className="app-container">{renderContent()}</div>

      <BottomMenu activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  )
}

export default App

