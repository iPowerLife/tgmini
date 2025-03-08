"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BottomMenu } from "../components/bottom-menu"
import { TasksContainer } from "../components/tasks-container"

export default function TasksPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Получаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("task_categories")
          .select("*")
          .order("id")

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])

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
        setTasks(tasksData || [])

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (!userError && userData) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", userData.user.id).single()

          setUser(profile || userData.user)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        // Создаем тестовые данные, если не удалось загрузить из базы
        setCategories([
          { id: 1, name: "daily", display_name: "Ежедневные", icon_url: "/icons/daily.svg" },
          { id: 2, name: "partners", display_name: "Партнеры", icon_url: "/icons/partners.svg" },
          { id: 3, name: "social", display_name: "Социальные", icon_url: "/icons/social.svg" },
        ])

        setTasks([
          {
            id: 1,
            title: "Ежедневный бонус",
            description: "Получите ежедневный бонус просто так",
            reward: 50,
            verification_time: 5,
            icon_url: "/icons/bonus.svg",
            category: { name: "daily", display_name: "Ежедневные" },
          },
          {
            id: 2,
            title: "Установить приложение",
            description: "Установите приложение нашего партнера",
            reward: 100,
            verification_time: 60,
            icon_url: "/icons/app.svg",
            link: "https://play.google.com/store/apps/details?id=example",
            category: { name: "partners", display_name: "Партнеры" },
          },
          {
            id: 3,
            title: "Подписаться на Telegram",
            description: "Подпишитесь на наш Telegram канал",
            reward: 50,
            verification_time: 30,
            icon_url: "/icons/telegram.svg",
            link: "https://t.me/example",
            category: { name: "social", display_name: "Социальные" },
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTaskComplete = async (taskId) => {
    // Обновляем локальное состояние
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))

    // Здесь можно добавить логику для обновления в базе данных
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
    <div className="min-h-screen bg-[#1A1F2E] pb-16">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center text-white mb-1">Задания</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Выполняйте задания и получайте награды</p>

        <TasksContainer
          tasks={tasks}
          categories={categories}
          user={user}
          onTaskComplete={handleTaskComplete}
          onBalanceUpdate={handleBalanceUpdate}
        />
      </div>
      <BottomMenu active="earn" />
    </div>
  )
}

