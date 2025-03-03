"use client"

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo } from "react"
import { AnimatePresence } from "framer-motion"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"
import { TasksSection } from "./components/tasks-section"
import { motion } from "framer-motion"
import { supabase } from "./supabase"

// Компонент для анимации страниц
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

// Компонент для содержимого приложения
function AppContent({ user, balance, handleBalanceUpdate, shopData, minersData, tasksData, handleTaskComplete }) {
  const location = useLocation()

  // Сброс скролла при изменении маршрута
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  // Мемоизируем отфильтрованные данные
  const { categories, models } = useMemo(() => shopData, [shopData])
  const { miners, totalPower } = useMemo(() => minersData, [minersData])
  const { tasks } = useMemo(() => tasksData, [tasksData])

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
                  <MinersList user={user} miners={miners} totalPower={totalPower} />
                </PageTransition>
              }
            />
            <Route
              path="/shop"
              element={
                <PageTransition>
                  <Shop user={user} onPurchase={handleBalanceUpdate} categories={categories} models={models} />
                </PageTransition>
              }
            />
            <Route
              path="/tasks"
              element={
                <PageTransition>
                  <TasksSection
                    user={user}
                    onBalanceUpdate={handleBalanceUpdate}
                    tasks={tasks}
                    onTaskComplete={handleTaskComplete}
                  />
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
                  <UserProfile user={user} miners={miners} totalPower={totalPower} />
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

  // Состояния для данных
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState({ miners: [], totalPower: 0 })
  const [tasksData, setTasksData] = useState({ tasks: [] })

  // Загрузка данных магазина
  const loadShopData = useCallback(async () => {
    if (!user?.id) return

    try {
      const [categoriesResponse, modelsResponse] = await Promise.all([
        supabase.from("miner_categories").select("*").order("id"),
        supabase.from("miner_models").select("*").order("category_id, price"),
      ])

      if (categoriesResponse.error) throw categoriesResponse.error
      if (modelsResponse.error) throw modelsResponse.error

      setShopData({
        categories: categoriesResponse.data,
        models: modelsResponse.data,
      })
    } catch (error) {
      console.error("Error loading shop data:", error)
    }
  }, [user?.id])

  // Загрузка данных майнеров
  const loadMinersData = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
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
        .eq("user_id", user.id)
        .order("purchased_at")

      if (error) throw error

      const totalPower = data.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
      setMinersData({ miners: data, totalPower })
    } catch (error) {
      console.error("Error loading miners data:", error)
    }
  }, [user?.id])

  // Загрузка данных заданий
  const loadTasksData = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasksData({ tasks: data?.tasks || [] })
    } catch (error) {
      console.error("Error loading tasks data:", error)
    }
  }, [user?.id])

  // Инициализация приложения
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

  // Загрузка всех данных при изменении пользователя
  useEffect(() => {
    if (user?.id) {
      Promise.all([loadShopData(), loadMinersData(), loadTasksData()])
    }
  }, [user?.id, loadShopData, loadMinersData, loadTasksData])

  // Обработчик обновления баланса
  const handleBalanceUpdate = useCallback(
    (newBalance) => {
      setBalance(newBalance)
      setUser((prev) => ({ ...prev, balance: newBalance }))
      // Перезагружаем данные майнеров после обновления баланса
      loadMinersData()
    },
    [loadMinersData],
  )

  // Обработчик завершения задания
  const handleTaskComplete = useCallback(
    (taskId) => {
      loadTasksData()
    },
    [loadTasksData],
  )

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
        handleTaskComplete={handleTaskComplete}
      />
    </Router>
  )
}

export default App

