"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Начинаем загрузку данных...")

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
        } else {
          setUser(userData)
          console.log("Пользователь загружен:", userData)
        }

        // Получаем категории
        const { data: categoriesData, error: categoriesError } = await supabase.from("task_categories").select("*")

        if (categoriesError) {
          console.error("Ошибка при получении категорий:", categoriesError)
        } else {
          console.log("Категории получены:", categoriesData)

          // Создаем объект для быстрого доступа к категориям по id
          const categoriesMap = {}
          categoriesData.forEach((category) => {
            categoriesMap[category.id] = category.name
          })

          setCategories(categoriesMap)
          console.log("Карта категорий:", categoriesMap)
        }

        // Получаем задания
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("is_active", true)

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
        } else {
          console.log("Задания получены:", tasksData)

          // Если нет заданий, создаем тестовые
          if (!tasksData || tasksData.length === 0) {
            console.log("Нет заданий, создаем тестовые")
            const mockTasks = createMockTasks()
            setTasks(mockTasks)
          } else {
            setTasks(tasksData)
          }
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
      {
        id: "1",
        title: "Посмотреть видео",
        description: "Посмотрите короткое видео",
        reward: 30,
        is_active: true,
        category_id: 1, // daily
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/youtube.png",
      },
      {
        id: "2",
        title: "Пройти опрос",
        description: "Пройдите короткий опрос",
        reward: 40,
        is_active: true,
        category_id: 1, // daily
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/quiz.png",
      },
      {
        id: "3",
        title: "Ежедневный бонус",
        description: "Получите ежедневный бонус",
        reward: 50,
        is_active: true,
        category_id: 1, // daily
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/coin.png",
      },
      {
        id: "4",
        title: "Установить приложение",
        description: "Установите партнерское приложение",
        reward: 100,
        is_active: true,
        category_id: 2, // partners
        icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/app.png",
      },
      {
        id: "5",
        title: "Подписаться на канал",
        description: "Подпишитесь на наш Telegram канал",
        reward: 60,
        is_active: true,
        category_id: 3, // social
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
      <header className="px-4 py-3 flex items-center justify-between border-b border-[#2A3142]/30">
        <div className="flex items-center">
          <button className="text-gray-400 hover:text-white transition-colors">Закрыть</button>
        </div>
        <div className="text-xs text-gray-400">Заданий: {tasks.length}</div>
      </header>

      <TasksSection
        user={user}
        tasks={tasks}
        categories={categories}
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />

      <BottomMenu active="earn" />
    </div>
  )
}

