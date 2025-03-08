"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/home"
import ShopPage from "./pages/shop"
import TasksPage from "./pages/tasks"
import RatingPage from "./pages/rating"
import ProfilePage from "./pages/profile"
import { supabase } from "./supabase"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем авторизацию пользователя
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (data && data.session) {
          setUser(data.session.user)
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Подписываемся на изменения авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1F2E]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app-wrapper">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/shop" element={<ShopPage user={user} />} />
            <Route path="/tasks" element={<TasksPage user={user} />} />
            <Route path="/rating" element={<RatingPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

