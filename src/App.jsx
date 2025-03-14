"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import ShopPage from "./pages/shop-page"
import TasksPage from "./pages/tasks"
import RatingPage from "./pages/rating-page"
import ProfilePage from "./pages/profile-page"
import { BottomMenu } from "./components/bottom-menu"
import { LoadingScreen } from "./components/loading-screen"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [tg, setTg] = useState(null)

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegramApp = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp
        setTg(webApp)

        // Подписываемся на событие готовности WebApp
        webApp.onEvent("viewportChanged", () => {
          console.log("Viewport changed")
        })

        webApp.onEvent("themeChanged", () => {
          console.log("Theme changed")
        })

        // Инициализируем WebApp
        try {
          webApp.ready()
          webApp.expand()
          webApp.setBackgroundColor("#1A1F2E")
        } catch (error) {
          console.error("Error initializing Telegram WebApp:", error)
        }
      } else {
        console.log("Telegram WebApp not available")
      }
    }

    // Пытаемся инициализировать сразу
    initTelegramApp()

    // И также подписываемся на событие загрузки окна
    window.addEventListener("load", initTelegramApp)

    return () => {
      window.removeEventListener("load", initTelegramApp)
    }
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Получаем текущую сессию
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)

        if (session?.user) {
          await fetchUserData(session.user.id)
        }
      } catch (error) {
        console.error("Error initializing app:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserData(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      if (data) {
        setUser(data)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Показываем загрузочный экран
  if (loading) {
    return <LoadingScreen />
  }

  // Если нет сессии, редиректим на страницу входа
  if (!session) {
    window.location.href = "/auth"
    return null
  }

  return (
    <Router>
      <div className="h-screen flex flex-col bg-[#1A1F2E] text-white overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/shop" element={<ShopPage user={user} />} />
          <Route path="/tasks" element={<TasksPage user={user} />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomMenu />
      </div>
    </Router>
  )
}

export default App

