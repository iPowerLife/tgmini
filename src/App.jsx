"use client"

import React from "react"

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

// Простой компонент для уведомлений
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === "error" ? "bg-red-500" : "bg-green-500"
      } text-white max-w-xs z-50`}
    >
      <div className="flex justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 font-bold">
          &times;
        </button>
      </div>
    </div>
  )
}

// Контекст для уведомлений
export const ToastContext = React.createContext({
  showToast: () => {},
})

// Компонент для предотвращения перенаправления при обновлении страницы
const AppContent = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [cachedMiningInfo, setCachedMiningInfo] = useState(null)
  const [toast, setToast] = useState(null)

  // Функция для показа уведомлений
  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  // Функция для кэширования данных майнинга
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
    <ToastContext.Provider value={{ showToast }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
    </ToastContext.Provider>
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
      </Router>
    </AuthProvider>
  )
}

export default App

