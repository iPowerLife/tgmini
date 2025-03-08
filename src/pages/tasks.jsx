"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BottomMenu } from "../components/bottom-menu"
import { TasksSection } from "../components/tasks-section"

export default function TasksPage({ user: initialUser }) {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(initialUser || null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Получаем задания
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select(`
            *,
            category:task_categories(name, display_name)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (tasksError) throw tasksError

        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData)
        } else {
          // Если заданий нет, создаем тестовые
          setTasks(createMockTasks())
        }

        // Получаем данные пользователя, если они не были переданы
        if (!user) {
          const { data: userData } = await supabase.from("users").select("*").single()

          if (userData) setUser(userData)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        // Создаем тестовые данные при ошибке
        setTasks(createMockTasks())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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
        category: { name: "daily", display_name: "Ежедневные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
      },
      {
        id: 2,
        title: "Посмотреть видео",
        description: "Посмотрите короткое видео",
        reward: 30,
        is_active: true,
        category_id: 1,
        category: { name: "daily", display_name: "Ежедневные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
      },
      // Partners tasks
      {
        id: 3,
        title: "Установить приложение",
        description: "Установите партнерское приложение",
        reward: 100,
        is_active: true,
        category_id: 2,
        category: { name: "partners", display_name: "Партнеры" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
      },
      // Social tasks
      {
        id: 4,
        title: "Подписаться на Telegram",
        description: "Подпишитесь на наш Telegram канал",
        reward: 60,
        is_active: true,
        category_id: 3,
        category: { name: "social", display_name: "Социальные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504941.png",
      },
    ]
  }

  const handleTaskComplete = (taskId) => {
    // Обновляем локальное состояние
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))
  }

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1F2E]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <TasksSection
        tasks={tasks}
        user={user}
        onTaskComplete={handleTaskComplete}
        onBalanceUpdate={handleBalanceUpdate}
      />
      <BottomMenu active="earn" />
    </div>
  )
}

