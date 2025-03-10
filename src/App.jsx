"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect, useCallback, useRef } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import Shop from "./components/shop"
import React from "react"
import LoadingScreen from "./components/loading-screen"
import TasksPage from "./pages/tasks"
import { RatingSection } from "./components/rating-section"
import { UserProfile } from "./components/user-profile"
import { preloadImages } from "./utils/image-preloader"

// Создаем контекст для кэширования данных
const DataContext = React.createContext(null)

function App() {
  // Используем useRef для отслеживания монтирования
  const isMounted = useRef(true)
  const initializationAttempted = useRef(false)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState({
    database: "pending",
    user: "pending",
    miners: "pending",
    mining: "pending",
    tasks: "pending",
    images: "pending",
  })
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Кэшируем данные в useRef
  const dataCache = useRef({
    shopData: null,
    minersData: null,
    tasksData: null,
    ratingData: null,
    transactionsData: null,
    ranksData: null,
    cachedMiningInfo: null,
  })

  // Функция для обновления прогресса загрузки
  const updateLoadingProgress = useCallback((step, status, progressIncrement = 0) => {
    if (!isMounted.current) return

    setLoadingSteps((prev) => ({ ...prev, [step]: status }))
    if (progressIncrement > 0) {
      setLoadingProgress((prev) => Math.min(100, prev + progressIncrement))
    }
  }, [])

  // Инициализация приложения
  useEffect(() => {
    if (!isMounted.current || initializationAttempted.current) return

    initializationAttempted.current = true

    const initApp = async () => {
      try {
        setLoading(true)
        setError(null)
        setLoadingProgress(5)

        console.log("Initializing app...")
        updateLoadingProgress("database", "loading")

        const telegram = initTelegram()
        console.log("Telegram WebApp status:", telegram ? "доступен" : "недоступен")

        // Проверяем подключение к базе данных
        try {
          const { error: healthError } = await supabase.from("health_check").select("*").limit(1)
          if (healthError) {
            console.warn("Health check table not found, but connection is working")
          }
        } catch (error) {
          console.warn("Health check failed, but continuing:", error)
        }

        updateLoadingProgress("database", "complete", 10)
        setLoadingProgress(15)

        updateLoadingProgress("user", "loading")
        const userData = getTelegramUser()

        if (!userData) {
          throw new Error("Не удалось получить данные пользователя из Telegram")
        }

        const dbUser = await createOrUpdateUser(userData)
        updateLoadingProgress("user", "complete", 15)
        setLoadingProgress(30)

        if (isMounted.current) {
          const userWithDisplay = {
            ...dbUser,
            photo_url: userData.photo_url,
            display_name: userData.username
              ? `@${userData.username}`
              : userData.first_name || "Неизвестный пользователь",
          }

          setUser(userWithDisplay)
          setBalance(dbUser.balance)

          // Загружаем все данные только один раз
          await Promise.all([
            loadInitialData(userWithDisplay.id),
            preloadImages([], (progress) => {
              updateLoadingProgress("images", "loading", progress * 10)
            }),
          ])

          setLoadingProgress(100)
        }
      } catch (err) {
        console.error("Error initializing app:", err)
        if (isMounted.current) {
          setError(err.message)
          setLoadingProgress(100)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    initApp()

    return () => {
      isMounted.current = false
    }
  }, [])

  // Функция для загрузки начальных данных
  const loadInitialData = async (userId) => {
    if (!userId || !isMounted.current) return

    try {
      const [
        shopResponse,
        minersResponse,
        tasksResponse,
        ratingResponse,
        transactionsResponse,
        ranksResponse,
        miningInfoResponse,
      ] = await Promise.all([
        supabase.from("miner_categories").select("*").order("id"),
        supabase.from("user_miners").select("*").eq("user_id", userId),
        supabase.from("tasks").select("*").eq("is_active", true),
        supabase.rpc("get_users_rating"),
        supabase.from("transactions").select("*").eq("user_id", userId).limit(5),
        supabase.from("ranks").select("*").order("min_balance"),
        supabase.rpc("get_mining_info_with_rewards", { user_id_param: userId }),
      ])

      if (isMounted.current) {
        // Сохраняем все данные в кэш
        dataCache.current = {
          shopData: shopResponse.data || [],
          minersData: minersResponse.data || [],
          tasksData: tasksResponse.data || [],
          ratingData: ratingResponse.data || [],
          transactionsData: transactionsResponse.data || [],
          ranksData: ranksResponse.data || [],
          cachedMiningInfo: miningInfoResponse.data || null,
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    }
  }

  // Обработчик обновления баланса
  const handleBalanceUpdate = useCallback((newBalance) => {
    setBalance(newBalance)
    setUser((prev) => ({ ...prev, balance: newBalance }))
  }, [])

  if (showSplash) {
    return (
      <LoadingScreen
        isLoading={loading}
        loadingSteps={loadingSteps}
        progress={loadingProgress}
        onAnimationComplete={() => setShowSplash(false)}
      />
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
    <DataContext.Provider value={dataCache.current}>
      <Router>
        <div className="root-container">
          <div className="page-container">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    user={user}
                    balance={balance}
                    onBalanceUpdate={handleBalanceUpdate}
                    cachedMiningInfo={dataCache.current.cachedMiningInfo}
                  />
                }
              />
              <Route
                path="/miners"
                element={
                  <MinersList
                    miners={dataCache.current.minersData?.miners || []}
                    totalPower={dataCache.current.minersData?.totalPower || 0}
                  />
                }
              />
              <Route
                path="/shop"
                element={
                  <Shop
                    user={user}
                    onPurchase={handleBalanceUpdate}
                    categories={dataCache.current.shopData?.categories || []}
                    models={dataCache.current.shopData?.models || []}
                  />
                }
              />
              <Route
                path="/tasks"
                element={
                  <TasksPage
                    user={user}
                    onBalanceUpdate={handleBalanceUpdate}
                    tasks={dataCache.current.tasksData || []}
                  />
                }
              />
              <Route path="/rating" element={<RatingSection currentUserId={user?.id} />} />
              <Route
                path="/profile"
                element={
                  <UserProfile
                    user={user}
                    miners={dataCache.current.minersData?.miners || []}
                    totalPower={dataCache.current.minersData?.totalPower || 0}
                  />
                }
              />
            </Routes>
          </div>
          <div className="fixed-bottom-menu">
            <BottomMenu />
          </div>
        </div>
      </Router>
    </DataContext.Provider>
  )
}

export default App

