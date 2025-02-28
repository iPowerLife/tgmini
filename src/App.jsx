"use client"

import { useState, useEffect } from "react"
import { initTelegram, getTelegramUser, saveTelegramUser } from "./utils/telegram"
import { supabase } from "./supabase"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"

function App() {
  const [tg, setTg] = useState(null)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [activeSection, setActiveSection] = useState("home")
  const [showIncrease, setShowIncrease] = useState(false)

  useEffect(() => {
    const initTelegramAndUser = async () => {
      try {
        // Инициализируем Telegram WebApp
        const telegram = initTelegram()
        setTg(telegram)

        // Получаем пользователя Telegram всеми возможными способами
        const telegramUser = getTelegramUser()
        console.log("Final Telegram user data:", telegramUser)

        if (!telegramUser?.id) {
          throw new Error("Не удалось получить данные пользователя")
        }

        // Сохраняем данные пользователя в localStorage
        saveTelegramUser(telegramUser)

        // Ищем пользователя в базе
        const { data: users, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)

        if (selectError) {
          throw selectError
        }

        let dbUser = users?.[0]

        // Если пользователя нет, создаем
        if (!dbUser) {
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
            throw createError
          }

          dbUser = newUsers[0]

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
          photo_url: telegramUser.photo_url,
          username: telegramUser.username || dbUser.username,
          first_name: telegramUser.first_name || dbUser.first_name,
          last_name: telegramUser.last_name,
        }

        setUser(fullUser)
        setBalance(dbUser.balance)

        // Обновляем данные пользователя в базе
        await supabase
          .from("users")
          .update({
            username: telegramUser.username,
            first_name: telegramUser.first_name,
          })
          .eq("id", dbUser.id)
      } catch (error) {
        console.error("Error in initialization:", error)

        // Пытаемся получить сохраненного пользователя из localStorage
        const savedUser = localStorage.getItem("tg_user")
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
            setBalance(0) // Устанавливаем нулевой баланс для безопасности
          } catch (e) {
            console.error("Error parsing saved user:", e)
          }
        }
      }
    }

    initTelegramAndUser()
  }, [])

  // Остальной код компонента остается без изменений...
  const renderContent = () => {
    if (!user) {
      return (
        <div className="section-container">
          <div>Загрузка данных пользователя...</div>
          <div className="text-sm text-gray-500 mt-2">Убедитесь, что вы открыли приложение через Telegram</div>
        </div>
      )
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

