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
        const telegram = initTelegram()
        console.log("Telegram initialized:", telegram)
        setTg(telegram)

        let telegramUser = getTelegramUser()
        console.log("Got Telegram user:", telegramUser)

        if (!telegramUser?.id) {
          console.log("Using test user data")
          const testUser = {
            id: 12345,
            username: "testuser",
            first_name: "Test",
            last_name: "User",
          }
          telegramUser = testUser
        }

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

        if (!user) {
          console.log("Creating new user with data:", telegramUser)

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

        console.log("Setting user state:", user)
        setUser(user)
        setBalance(user.balance)
      } catch (error) {
        console.error("Error in initialization:", error)
        const testUser = {
          id: "test-id",
          telegram_id: 12345,
          username: "testuser",
          first_name: "Test",
          balance: 1000,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
        }
        setUser(testUser)
        setBalance(testUser.balance)
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

