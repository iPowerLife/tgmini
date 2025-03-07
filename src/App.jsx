"use client"

import { useEffect, useState } from "react"
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom"
import "./App.css"
import HomePage from "./pages/home-page"
import MinersPage from "./pages/miners-page"
import RatingPage from "./pages/rating-page"
import TransactionsPage from "./pages/transactions-page"
import RanksPage from "./pages/ranks-page"
import ProfilePage from "./pages/profile-page"
import AdminPanel from "./pages/admin-panel"
import SupportPage from "./pages/support-page"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Компонент для предотвращения перенаправления при обновлении страницы
const AppContent = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Добавляем кэширование данных на уровне приложения
  // Находим компонент AppContent и добавляем в него кэширование состояния
  const [cachedMiningInfo, setCachedMiningInfo] = useState(null)

  // Добавляем функцию для кэширования данных майнинга
  const cacheMiningInfo = (data) => {
    setCachedMiningInfo(data)
  }

  // Добавляем логирование для отслеживания жизненного цикла компонента
  useEffect(() => {
    console.log("AppContent mounted")

    // Добавляем обработчик для отслеживания перезагрузки страницы
    const handleBeforeUnload = (e) => {
      console.log("Page is about to unload")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      console.log("AppContent unmounted")
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Логирование при изменении маршрута
  useEffect(() => {
    console.log("Route changed to:", location.pathname)
  }, [location])

  // Логирование при изменении пользователя
  useEffect(() => {
    console.log("User state changed:", user ? "logged in" : "not logged in")
  }, [user])

  if (loading) {
    console.log("Auth loading...")
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage user={user} cachedMiningInfo={cachedMiningInfo} onCacheUpdate={cacheMiningInfo} />}
      />
      <Route path="/miners" element={<MinersPage />} />
      <Route path="/rating" element={<RatingPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/ranks" element={<RanksPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/support" element={<SupportPage />} />
      {/* Перенаправление на главную, если маршрут не найден */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => {
  // Добавляем логирование для отслеживания жизненного цикла компонента
  useEffect(() => {
    console.log("App mounted")

    // Добавляем обработчик для отслеживания ошибок
    const handleError = (error) => {
      console.error("Global error caught:", error)
    }

    window.addEventListener("error", handleError)

    return () => {
      console.log("App unmounted")
      window.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  )
}

export default App

