"use client"

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"
import { TasksSection } from "./components/tasks-section"
import { supabase } from "./supabase"

// Компонент для содержимого приложения
function AppContent({ user, balance, handleBalanceUpdate, shopData, minersData, tasksData, handleTaskComplete }) {
  const location = useLocation()

  // Добавляем отладочный вывод
  console.log("Rendering AppContent with path:", location.pathname)
  console.log("User data:", user)
  console.log("Shop data:", shopData)
  console.log("Miners data:", minersData)
  console.log("Tasks data:", tasksData)

  return (
    <div className="root-container">
      <div className="page-container">
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
                <MinersList user={user} miners={minersData.miners} totalPower={minersData.totalPower} />
              </>
            }
          />
          <Route
            path="/shop"
            element={
              <Shop
                user={user}
                onPurchase={handleBalanceUpdate}
                categories={shopData.categories}
                models={shopData.models}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksSection
                user={user}
                onBalanceUpdate={handleBalanceUpdate}
                tasks={tasksData.tasks}
                onTaskComplete={handleTaskComplete}
              />
            }
          />
          <Route path="/rating" element={<div className="section-container">Раздел рейтинга в разработке</div>} />
          <Route
            path="/profile"
            element={<UserProfile user={user} miners={minersData.miners} totalPower={minersData.totalPower} />}
          />
        </Routes>
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
      console.log("Loading shop data...")
      const [categoriesResponse, modelsResponse] = await Promise.all([
        supabase.from("miner_categories").select("*").order("id"),
        supabase.from("miner_models").select("*").order("category_id, price"),
      ])

      if (categoriesResponse.error) throw categoriesResponse.error
      if (modelsResponse.error) throw modelsResponse.error

      setShopData({
        categories: categoriesResponse.data || [],
        models: modelsResponse.data || [],
      })
      console.log("Shop data loaded successfully")
    } catch (error) {
      console.error("Error loading shop data:", error)
    }
  }, [user?.id])

  // Загрузка данных майнеров
  const loadMinersData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading miners data...")
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

      const totalPower = (data || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
      setMinersData({ miners: data || [], totalPower })
      console.log("Miners data loaded successfully")
    } catch (error) {
      console.error("Error loading miners data:", error)
    }
  }, [user?.id])

  // Загрузка данных заданий
  const loadTasksData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading tasks data...")
      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasksData({ tasks: data?.tasks || [] })
      console.log("Tasks data loaded successfully")
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

        console.log("Initializing app...")
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
          const userWithDisplay = {
            ...dbUser,
            photo_url: userData.photo_url,
            display_name: userData.username
              ? `@${userData.username}`
              : userData.first_name || "Неизвестный пользователь",
          }

          setUser(userWithDisplay)
          setBalance(dbUser.balance)
          console.log("User initialized:", userWithDisplay)

          // Загружаем все данные сразу после инициализации пользователя
          await Promise.all([loadShopData(), loadMinersData(), loadTasksData()])
          console.log("All data loaded successfully")
        }
      } catch (err) {
        console.error("Error initializing app:", err)
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
  }, [loadShopData, loadMinersData, loadTasksData])

  // Обработчик обновления баланса
  const handleBalanceUpdate = useCallback(
    (newBalance) => {
      console.log("Updating balance:", newBalance)
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
      console.log("Task completed:", taskId)
      loadTasksData()
    },
    [loadTasksData],
  )

  if (loading) {
    return (
      <div className="root-container">
        <div className="page-container">
          <div className="section-container">
            <div className="loading">Загрузка приложения...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="root-container">
        <div className="page-container">
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

