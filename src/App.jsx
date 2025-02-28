"use client"

import { useState, useEffect } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initApp = async () => {
      try {
        console.log("Начинаем инициализацию приложения...")
        setLoading(true)
        setError(null)

        // Инициализируем Telegram WebApp
        const telegram = initTelegram()
        console.log("Статус инициализации Telegram:", telegram ? "успешно" : "ошибка")

        // Получаем данные пользователя
        const userData = getTelegramUser()
        console.log("Полученные данные пользователя:", userData)

        if (!userData) {
          throw new Error("Не удалось получить данные пользователя")
        }

        // Проверяем наличие id
        if (!userData.id) {
          console.error("ID пользователя отсутствует:", userData)
          throw new Error("Некорректные данные пользователя (отсутствует ID)")
        }

        // Создаем или обновляем пользователя в базе
        console.log("Начинаем сохранение пользователя в базу...")
        const dbUser = await createOrUpdateUser(userData)
        console.log("Данные пользователя в базе:", dbUser)

        if (!dbUser) {
          throw new Error("Не удалось сохранить пользователя в базе")
        }

        if (mounted) {
          setUser({
            ...dbUser,
            photo_url: userData.photo_url,
            display_name: userData.username
              ? `@${userData.username}`
              : userData.first_name || "Неизвестный пользователь",
          })
          setBalance(dbUser.balance)
          setError(null)
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initApp()

    return () => {
      mounted = false
    }
  }, [])

  // Показываем загрузку
  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container">
            <div className="loading">Загрузка приложения...</div>
          </div>
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <p className="text-sm text-gray-400 mt-2">Попробуйте перезапустить приложение в Telegram</p>
            <button onClick={() => window.location.reload()} className="shop-button mt-4">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Показываем загрузку, если нет пользователя
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

