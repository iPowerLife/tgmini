"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Начинаем загрузку данных...")

        // Сразу создаем тестовые задания
        const mockTasks = createMockTasks()
        console.log("Созданы тестовые задания:", mockTasks)
        setTasks(mockTasks)

        // Пытаемся получить реальные задания из базы
        try {
          const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("is_active", true)

          if (!tasksError && tasksData && tasksData.length > 0) {
            console.log("Получены реальные задания:", tasksData)
            setTasks(tasksData)
          }
        } catch (e) {
          console.log("Ошибка при получении реальных заданий:", e)
        }

        // Получаем данные пользователя
        try {
          const { data: userData } = await supabase.from("users").select("*").single()
          if (userData) setUser(userData)
        } catch (e) {
          console.log("Ошибка при получении данных пользователя:", e)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Функция для создания тестовых заданий
  const createMockTasks = () => {
    return [
      // Daily tasks
      {
        id: 1,
        title: "Ежедневный бонус",
        description: "Получите ежедневный бонус",
        reward: 50,
        is_active: true,
        category_id: 1,
        category: "daily",
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
      },
      {
        id: 2,
        title: "Посмотреть видео",
        description: "Посмотрите короткое видео",
        reward: 30,
        is_active: true,
        category_id: 1,
        category: "daily",
        icon_url: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
      },
      {
        id: 3,
        title: "Пройти опрос",
        description: "Пройдите короткий опрос",
        reward: 40,
        is_active: true,
        category_id: 1,
        category: "daily",
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
      },

      // Partners tasks
      {
        id: 4,
        title: "Установить приложение",
        description: "Установите партнерское приложение",
        reward: 100,
        is_active: true,
        category_id: 2,
        category: "partners",
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
      },
      {
        id: 5,
        title: "VIP действия",
        description: "Выполните VIP задание от партнеров",
        reward: 150,
        is_active: true,
        category_id: 2,
        category: "partners",
        icon_url: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
      },

      // Social tasks
      {
        id: 6,
        title: "Подписаться на Telegram",
        description: "Подпишитесь на наш Telegram канал",
        reward: 60,
        is_active: true,
        category_id: 3,
        category: "social",
        icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504941.png",
      },
      {
        id: 7,
        title: "Подписаться на X",
        description: "Подпишитесь на наш аккаунт в X (Twitter)",
        reward: 60,
        is_active: true,
        category_id: 3,
        category: "social",
        icon_url: "https://cdn-icons-png.flaticon.com/512/3670/3670151.png",
      },
    ]
  }

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      })
    }
  }

  const handleTaskComplete = (taskId) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <TasksSection
        user={user}
        tasks={tasks}
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />
      <BottomMenu active="earn" />
    </div>
  )
}

