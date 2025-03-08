"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Фиктивные задания, которые гарантированно будут отображаться
  const mockTasks = [
    {
      id: 1,
      title: "Ежедневный бонус",
      description: "Получите ежедневный бонус",
      reward: 50,
      category: "daily",
      is_active: true,
      type: "simple",
    },
    {
      id: 2,
      title: "Посмотреть видео",
      description: "Посмотрите короткое видео",
      reward: 30,
      category: "daily",
      is_active: true,
      type: "video",
    },
    {
      id: 3,
      title: "Подпишись на канал",
      description: "Подпишитесь на наш Telegram канал",
      reward: 50,
      category: "partners",
      is_active: true,
      type: "social",
    },
    {
      id: 4,
      title: "Поделись постом",
      description: "Поделитесь нашим постом",
      reward: 40,
      category: "social",
      is_active: true,
      type: "social",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
        } else {
          setUser(userData)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      })
    }
  }

  const handleTaskComplete = (taskId) => {
    // Ничего не делаем, так как используем фиктивные данные
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1A1F2E] to-[#151A28]">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2E] to-[#151A28] text-white">
      <header className="px-4 py-3 flex items-center justify-between bg-[#1A1F2E] border-b border-[#2A3142]/30">
        <div className="flex items-center">
          <button className="text-gray-400 hover:text-white transition-colors">Закрыть</button>
        </div>
      </header>

      <TasksSection
        user={user}
        tasks={mockTasks}
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />

      <BottomMenu active="earn" />
    </div>
  )
}

