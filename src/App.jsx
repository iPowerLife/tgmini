"use client"

import { useState, useEffect } from "react"
import { getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [activeSection, setActiveSection] = useState("home")
  const [showIncrease, setShowIncrease] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initApp = async () => {
      try {
        // Получаем данные пользователя из Telegram
        const telegramUser = getTelegramUser()
        console.log("Telegram user data:", telegramUser)

        if (!telegramUser) {
          throw new Error("Не удалось получить данные пользователя")
        }

        // Создаем или обновляем пользователя в базе
        const dbUser = await createOrUpdateUser(telegramUser)
        console.log("Database user:", dbUser)

        // Объединяем данные
        const fullUser = {
          ...dbUser,
          photo_url: telegramUser.photo_url,
          display_name: telegramUser.username ? `@${telegramUser.username}` : telegramUser.first_name || "Unknown User",
        }

        setUser(fullUser)
        setBalance(dbUser.balance)
        setError(null)
      } catch (err) {
        console.error("Error initializing app:", err)
        setError(err.message)
      }
    }

    initApp()
  }, [])

  if (error) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 mt-4 bg-blue-500 text-white rounded">
              Попробовать снова
            </button>
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
            <div className="loading">Загрузка данных пользователя...</div>
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

