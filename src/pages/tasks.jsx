"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
        } else {
          setUser(userData)
        }

        // Получаем задания
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("is_active", true)

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
          setError("Не удалось загрузить задания")
        } else {
          console.log("Задания получены:", tasksData)

          // Проверяем наличие icon_url
          const tasksWithIcons = tasksData.map((task) => {
            console.log(`Задание ${task.id} (${task.title}) - icon_url:`, task.icon_url)
            return task
          })

          // Если нет заданий, создаем тестовые
          if (!tasksWithIcons || tasksWithIcons.length === 0) {
            console.log("Создаем тестовые задания")
            const mockTasks = [
              {
                id: "1",
                title: "Посмотреть видео",
                description: "Посмотрите короткое видео",
                reward: 30,
                type: "video",
                is_active: true,
                icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/youtube.png",
              },
              {
                id: "2",
                title: "Пройти опрос",
                description: "Пройдите короткий опрос",
                reward: 40,
                type: "quiz",
                is_active: true,
                icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/quiz.png",
              },
              {
                id: "3",
                title: "Ежедневный бонус",
                description: "Получите ежедневный бонус",
                reward: 50,
                type: "simple",
                is_active: true,
                icon_url: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/coin.png",
              },
            ]
            setTasks(mockTasks)
          } else {
            setTasks(tasksWithIcons)
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setError("Произошла ошибка при загрузке данных")
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
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <div className="text-red-500 mb-4">Ошибка: {error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 rounded-lg">
          Попробовать снова
        </button>
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
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />

      <BottomMenu active="earn" />
    </div>
  )
}

