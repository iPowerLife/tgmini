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
      setLoading(true)

      // Получаем данные пользователя
      const { data: userData, error: userError } = await supabase.from("users").select("*").single()

      if (userError) {
        console.error("Ошибка при получении данных пользователя:", userError)
      } else {
        setUser(userData)
      }

      // Получаем категории заданий
      const { data: categoriesData } = await supabase.from("task_categories").select("*")

      // Создаем объект для быстрого доступа к категориям по ID
      const categoriesMap = {}
      if (categoriesData) {
        categoriesData.forEach((category) => {
          categoriesMap[category.id] = category
        })
      }

      // Получаем все задания
      const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*")

      if (tasksError) {
        console.error("Ошибка при получении заданий:", tasksError)
      } else if (tasksData) {
        // Добавляем информацию о категории к каждому заданию
        const processedTasks = tasksData.map((task) => {
          const category = categoriesMap[task.category_id]
          return {
            ...task,
            task_categories: category,
            category: category?.name || "daily",
            is_completed: false,
            user_status: "new",
            reward_claimed: false,
            is_expired: false,
          }
        })

        console.log("Обработанные задания:", processedTasks)
        setTasks(processedTasks)
      }

      setLoading(false)
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
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true, user_status: "completed" } : task)),
    )
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
        tasks={tasks}
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />

      <BottomMenu active="earn" />
    </div>
  )
}

