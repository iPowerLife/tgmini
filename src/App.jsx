"use client"

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { supabase } from "./utils/supabaseClient"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"
import { TasksSection } from "./components/tasks-section"
import { PageTransition } from "./components/page-transition"

function AppContent({ user, balance, handleBalanceUpdate, shopData, minersData, tasksData, statsData }) {
  const location = useLocation()

  useEffect(() => {
    const appContainer = document.querySelector(".app-container")
    if (appContainer) {
      appContainer.scrollTop = 0
    }
  }, [location])

  return (
    <div className="app-wrapper">
      <div className="background-gradient" />
      <div className="decorative-circle-1" />
      <div className="decorative-circle-2" />

      <div className="app-container pb-14">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
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
                    <MinersList user={user} miners={minersData} />
                  </>
                </PageTransition>
              }
            />
            <Route
              path="/shop"
              element={
                <PageTransition>
                  <Shop user={user} onPurchase={handleBalanceUpdate} shopData={shopData} />
                </PageTransition>
              }
            />
            <Route
              path="/tasks"
              element={
                <PageTransition>
                  <TasksSection user={user} onBalanceUpdate={handleBalanceUpdate} tasks={tasksData} />
                </PageTransition>
              }
            />
            <Route
              path="/rating"
              element={
                <PageTransition>
                  <div className="section-container">Раздел рейтинга в разработке</div>
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <UserProfile user={user} stats={statsData} miners={minersData} />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      <BottomMenu />
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState([])
  const [tasksData, setTasksData] = useState([])
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    let mounted = true

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

        // Загружаем все данные параллельно
        const [{ data: categories }, { data: models }, { data: miners }, { data: tasks }, { data: stats }] =
          await Promise.all([
            supabase.from("miner_categories").select("*").order("id"),
            supabase.from("miner_models").select("*").order("category_id, price"),
            supabase
              .from("user_miners")
              .select(`
            *,
            model:miner_models (
              id,
              name,
              display_name,
              mining_power,
              energy_consumption
            )
          `)
              .eq("user_id", dbUser.id),
            supabase.rpc("get_available_tasks", { user_id_param: dbUser.id }),
            supabase.from("mining_stats").select("*").eq("user_id", dbUser.id).single(),
          ])

        if (mounted) {
          setUser({
            ...dbUser,
            photo_url: userData.photo_url,
            display_name: userData.username
              ? `@${userData.username}`
              : userData.first_name || "Неизвестный пользователь",
          })
          setBalance(dbUser.balance)
          setShopData({ categories: categories || [], models: models || [] })
          setMinersData(miners || [])
          setTasksData(tasks?.tasks || [])
          setStatsData(stats || { total_mined: 0, mining_count: 0 })
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
      <AppContent
        user={user}
        balance={balance}
        handleBalanceUpdate={handleBalanceUpdate}
        shopData={shopData}
        minersData={minersData}
        tasksData={tasksData}
        statsData={statsData}
      />
    </Router>
  )
}

export default App

