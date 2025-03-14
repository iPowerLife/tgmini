"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import ShopPage from "./pages/shop-page"
import TasksPage from "./pages/tasks"
import RatingPage from "./pages/rating-page"
import ProfilePage from "./pages/profile-page"
import BottomMenu from "./components/bottom-menu"
import LoadingScreen from "./components/loading-screen"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserData(session.user.id)
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
    } finally {
      setLoading(false)
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

