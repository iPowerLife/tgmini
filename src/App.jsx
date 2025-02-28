"use client"

import { useState, useEffect } from "react"
import { initTelegram, useTelegramUser } from "./utils/telegram"
import { supabase } from "./supabase"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [activeSection, setActiveSection] = useState("home")
  const [showIncrease, setShowIncrease] = useState(false)
  const telegramUser = useTelegramUser()

  useEffect(() => {
    const initApp = async () => {
      try {
        // Инициализируем Telegram WebApp
        initTelegram()

        // Ищем пользователя в базе
        const { data: users, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (selectError && selectError.code !== "PGRST116") {
          throw selectError
        }

        let dbUser = users

        // Если пользователя нет, создаем
        if (!dbUser) {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                first_name: telegramUser.firstName,
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
            throw createError
          }

          dbUser = newUser

          // Создаем запись в mining_stats
          await supabase.from("mining_stats").insert([
            {
              user_id: dbUser.id,
              total_mined: 0,
              mining_count: 0,
            },
          ])
        }

        // Объединяем данные из базы и Telegram
        const fullUser = {
          ...dbUser,
          telegram_id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.firstName,
          photo_url: telegramUser.photoUrl,
        }

        setUser(fullUser)
        setBalance(dbUser.balance)
      } catch (error) {
        console.error("Error initializing app:", error)
      }
    }

    initApp()
  }, [telegramUser.id, telegramUser.username, telegramUser.firstName, telegramUser.photoUrl])

  const renderContent = () => {
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

