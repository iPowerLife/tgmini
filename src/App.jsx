"use client"

import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { initTelegram } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import LoadingScreen from "./components/loading-screen"
import { DataPrefetcher } from "./utils/data-prefetcher"
import { useUserData } from "./hooks/use-user-data"
import { clearQueryCache } from "./hooks/use-supabase-query"

// Импортируем страницы
import HomePage from "./pages/home-page"
import Shop from "./components/shop"
import TasksPage from "./pages/tasks"
import { RatingSection } from "./components/rating-section"
import { UserProfile } from "./components/user-profile"
import { MinersList } from "./components/miners-list"

// Контекст для уведомлений
const ToastContext = React.createContext({
  showToast: () => {},
})

function AppContent({ user, balance, handleBalanceUpdate }) {
  // Состояние для уведомлений
  const [toast, setToast] = useState(null)

  // Функция для показа уведомлений
  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="root-container">
        {/* Единственный скроллируемый контейнер */}
        <div className="page-container">
          <Routes>
            <Route
              path="/"
              element={
                <div className="page-content" key="home-page">
                  <HomePage user={user} />
                </div>
              }
            />
            <Route
              path="/miners"
              element={
                <div className="page-content" key="miners-page">
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
                  <MinersList />
                </div>
              }
            />
            <Route
              path="/shop"
              element={
                <div className="page-content" key="shop-page">
                  <Shop user={user} onPurchase={handleBalanceUpdate} />
                </div>
              }
            />
            <Route
              path="/tasks"
              element={
                <div className="page-content" key="tasks-page">
                  <TasksPage user={user} onBalanceUpdate={handleBalanceUpdate} />
                </div>
              }
            />
            <Route
              path="/rating"
              element={
                <div className="page-content" key="rating-page">
                  <RatingSection currentUserId={user?.id} />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="page-content" key="profile-page">
                  <UserProfile user={user} />
                </div>
              }
            />
          </Routes>
        </div>

        {/* Фиксированное нижнее меню */}
        <div className="fixed-bottom-menu">
          <BottomMenu />
        </div>
      </div>
    </ToastContext.Provider>
  )
}

function AppOptimized() {
  // Используем оптимизированный хук для получения данных пользователя
  const { user, telegramUser, isLoading: userLoading, updateBalance } = useUserData()

  // Состояние для загрузочного экрана
  const [showSplash, setShowSplash] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState({
    database: "pending",
    user: "pending",
    miners: "pending",
    mining: "pending",
    tasks: "pending",
    images: "pending",
    shop: "pending",
  })
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Инициализация Telegram
  useEffect(() => {
    initTelegram()
  }, [])

  // Обработчик прогресса загрузки данных
  const handleLoadingProgress = ({ step, progress }) => {
    setLoadingSteps((prev) => ({
      ...prev,
      [step]: step === "complete" ? "complete" : "loading",
    }))

    setLoadingProgress(progress * 100)

    if (step === "complete") {
      // Завершаем все шаги
      setLoadingSteps((prev) => {
        const newSteps = {}
        Object.keys(prev).forEach((key) => {
          newSteps[key] = "complete"
        })
        return newSteps
      })

      // Скрываем загрузочный экран через 1.5 секунды
      setTimeout(() => setShowSplash(false), 1500)
    }
  }

  // Обработчик завершения загрузки данных
  const handleLoadingComplete = () => {
    setLoadingProgress(100)
  }

  // Обработчик обновления баланса
  const handleBalanceUpdate = async (newBalance) => {
    await updateBalance(newBalance)
  }

  // Очищаем кэш при размонтировании компонента
  useEffect(() => {
    return () => {
      clearQueryCache()
    }
  }, [])

  // Отображение загрузочного экрана или контента приложения
  return (
    <Router>
      {showSplash ? (
        <>
          <LoadingScreen loadingProgress={loadingProgress} loadingSteps={loadingSteps} />
          {user && (
            <DataPrefetcher userId={user.id} onProgress={handleLoadingProgress} onComplete={handleLoadingComplete} />
          )}
        </>
      ) : userLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <AppContent user={user} balance={user?.balance || 0} handleBalanceUpdate={handleBalanceUpdate} />
      )}
    </Router>
  )
}

export default AppOptimized

