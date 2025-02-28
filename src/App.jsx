"use client"

import { useState, useEffect } from "react"
import { initTelegram, getTelegramUser } from "./utils/telegram"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      try {
        // Инициализируем Telegram WebApp
        const tg = initTelegram()
        if (!tg) {
          throw new Error("Telegram WebApp не найден")
        }

        // Получаем данные пользователя
        const telegramUser = getTelegramUser()
        if (!telegramUser?.id) {
          throw new Error("Не удалось получить данные пользователя")
        }

        console.log("Telegram user:", telegramUser)

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
                first_name: telegramUser.first_name,
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
          first_name: telegramUser.first_name,
          photo_url: telegramUser.photo_url,
        }

        setUser(fullUser)
        setBalance(dbUser.balance)
      } catch (error) {
        console.error("Error initializing app:", error)
        // Не устанавливаем пользователя, чтобы показать сообщение об ошибке
      } finally {
        setLoading(false)
      }
    }

    initApp()
  }, [])

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container">
            <div>Загрузка приложения...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container">
            <div className="text-lg font-bold mb-2">Ошибка загрузки данных</div>
            <div className="text-sm mb-4">Убедитесь, что вы открыли приложение через Telegram</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded">
              Перезагрузить
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
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

