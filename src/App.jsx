"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import ShopPage from "./pages/shop-page"
import ProfilePage from "./pages/profile-page"
import RatingPage from "./pages/rating-page"

// Компонент для навигации
const Navigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate()

  const handleTabChange = (tab) => {
    onTabChange(tab)

    switch (tab) {
      case "home":
        navigate("/")
        break
      case "shop":
        navigate("/shop")
        break
      case "rating":
        navigate("/rating")
        break
      case "profile":
        navigate("/profile")
        break
      default:
        navigate("/")
    }
  }

  return (
    <div className="bg-[#242838]/80 p-3 flex justify-around">
      <button
        className={`p-2 rounded-lg ${activeTab === "home" ? "bg-blue-500/50" : ""}`}
        onClick={() => handleTabChange("home")}
      >
        🏠
      </button>
      <button
        className={`p-2 rounded-lg ${activeTab === "shop" ? "bg-blue-500/50" : ""}`}
        onClick={() => handleTabChange("shop")}
      >
        🛒
      </button>
      <button
        className={`p-2 rounded-lg ${activeTab === "rating" ? "bg-blue-500/50" : ""}`}
        onClick={() => handleTabChange("rating")}
      >
        🏆
      </button>
      <button
        className={`p-2 rounded-lg ${activeTab === "profile" ? "bg-blue-500/50" : ""}`}
        onClick={() => handleTabChange("profile")}
      >
        👤
      </button>
    </div>
  )
}

// Основной компонент приложения
function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("home")
  const [user, setUser] = useState(null)

  // Проверка соединения с Supabase и загрузка данных пользователя
  useEffect(() => {
    const initApp = async () => {
      try {
        // Получаем текущую сессию
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Загружаем данные пользователя
          const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error) {
            throw error
          }

          if (data) {
            setUser(data)
          }
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        setError(`Ошибка загрузки данных: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    initApp()
  }, [])

  // Инициализация Telegram WebApp (если доступен)
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        console.log("Telegram WebApp инициализирован")
      } catch (err) {
        console.warn("Ошибка инициализации Telegram WebApp:", err)
      }
    }
  }, [])

  // Сбрасываем флаги при обновлении страницы и возвращаемся на главную
  useEffect(() => {
    const handlePageRefresh = () => {
      setActiveTab("home")
      // Используем sessionStorage для отслеживания обновления страницы
      if (!sessionStorage.getItem("app_initialized")) {
        sessionStorage.setItem("app_initialized", "true")
      } else {
        // Если приложение уже было инициализировано, значит это обновление страницы
        window.location.href = "/"
      }
    }

    // Вызываем при первой загрузке
    handlePageRefresh()

    // Добавляем обработчик события beforeunload для отслеживания обновления страницы
    window.addEventListener("beforeunload", () => {
      sessionStorage.removeItem("app_initialized")
    })

    return () => {
      window.removeEventListener("beforeunload", () => {
        sessionStorage.removeItem("app_initialized")
      })
    }
  }, [])

  // Обработчик обновления баланса пользователя
  const handleBalanceUpdate = (newBalance, updateMinerPass = false) => {
    setUser((prev) => ({
      ...prev,
      balance: newBalance,
      hasMinerPass: updateMinerPass ? true : prev.hasMinerPass,
    }))
  }

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A1F2E] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A1F2E] text-white">
        <div className="text-center max-w-md p-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Ошибка</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="fixed inset-0 flex flex-col bg-[#1A1F2E] text-white">
        {/* Верхний блок с заголовком */}
        <div className="bg-[#242838]/80 p-3 text-center">
          <h1 className="font-bold text-xl">Майнинг Игра</h1>
        </div>

        {/* Основной контент */}
        <div className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/shop" element={<ShopPage user={user} onBalanceUpdate={handleBalanceUpdate} />} />
            <Route path="/rating" element={<RatingPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Нижнее меню */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Router>
  )
}

export default App

