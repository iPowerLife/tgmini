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

        // Получаем задания вместе с категориями одним запросом
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select(`
            *,
            task_categories (
              id,
              name
            )
          `)
          .eq("is_active", true)

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
          // Если ошибка, создаем тестовые задания
          const mockTasks = createMockTasks()
          setTasks(mockTasks)
        } else {
          console.log("Получены задания:", tasksData)

          if (!tasksData || tasksData.length === 0) {
            console.log("Нет заданий в базе, создаем тестовые")
            const mockTasks = createMockTasks()
            setTasks(mockTasks)
          } else {
            // Преобразуем данные для удобства использования
            const processedTasks = tasksData.map((task) => ({
              ...task,
              category_name: task.task_categories?.name || "daily",
            }))
            setTasks(processedTasks)
          }
        }

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
        } else {
          setUser(userData)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        // В случае ошибки также создаем тестовые задания
        const mockTasks = createMockTasks()
        setTasks(mockTasks)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Функция для создания тестовых заданий
  const createMockTasks = () => {
    return [
      {
        id: 1,
        title: "Ежедневный бонус",
        description: "Получите ежедневный бонус",
        reward: 50,
        is_active: true,
        category_id: 1,
        task_categories: { id: 1, name: "daily" },
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/coin.png",
      },
      {
        id: 2,
        title: "Установить приложение",
        description: "Установите партнерское приложение",
        reward: 100,
        is_active: true,
        category_id: 2,
        task_categories: { id: 2, name: "partners" },
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/app.png",
      },
      {
        id: 3,
        title: "Подписаться на канал",
        description: "Подпишитесь на наш Telegram канал",
        reward: 60,
        is_active: true,
        category_id: 3,
        task_categories: { id: 3, name: "social" },
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/telegram.png",
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

