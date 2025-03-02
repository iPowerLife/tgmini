"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"
import { TasksSection } from "./components/tasks-section"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  useEffect(() => {
    let mounted = true
	document.getElementById("root").scrollTo(0, 0)

    const initApp = async () => {
      try {
        setLoading(true)
        setError(null)

        const telegram = initTelegram()
        console.log("Telegram WebApp status:", telegram ? "доступен" : "недоступен")

        const userData = getTelegramUser()
        console.log("User data:", userData)

        if (!userData) {
          throw new Error("Не удалось получить данные пользователя из Telegram")
        }

        const dbUser = await createOrUpdateUser(userData)
        console.log("Database user:", dbUser)

        if (!dbUser) {
          throw new Error("Не удалось создать/обновить пользователя в базе")
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

  const handleBalanceUpdate = (newBalance) => {
    setBalance(newBalance)
    setUser((prev) => ({ ...prev, balance: newBalance }))
  }

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

  if (error) {
    return (
      <div className="app-wrapper">
        <div className="app-container">
          <div className="section-container error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="shop-button mt-4">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app-wrapper">
        <div className="background-gradient" />
        <div className="decorative-circle-1" />
        <div className="decorative-circle-2" />

        <div className="app-container pb-14">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="balance-card">
                    <div className="balance-background" />
                    <div className="balance-content">
                      <div className="balance-label">Баланс</div>
                      <div className="balance-amount">
                        <span>{balance.toFixed(2)}</span>
                        <span className="balance-currency">💎</span>
                      </div>
                    </div>
                  </div>
                  <MinersList user={user} />
                </>
              }
            />
            <Route path="/shop" element={<Shop user={user} onPurchase={handleBalanceUpdate} />} />
            <Route path="/tasks" element={<TasksSection user={user} onBalanceUpdate={handleBalanceUpdate} />} />
            <Route path="/rating" element={<div className="section-container">Раздел рейтинга в разработке</div>} />
            <Route path="/profile" element={<UserProfile user={user} />} />
          </Routes>
        </div>

        <BottomMenu />
      </div>
    </Router>
  )
}

export default App

