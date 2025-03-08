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

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) throw userError
        setUser(userData)

        // Получаем все задания без inner join
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*, task_categories(*)")

        if (tasksError) throw tasksError

        // Логируем полученные данные
        console.log("Данные из БД:", tasksData)

        if (tasksData) {
          const processedTasks = tasksData.map((task) => ({
            ...task,
            category: task.task_categories?.name?.toLowerCase() || "daily",
          }))

          console.log("Обработанные задания:", processedTasks)
          setTasks(processedTasks)
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
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">Закрыть</button>
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

