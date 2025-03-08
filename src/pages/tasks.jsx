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

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
        } else {
          setUser(userData)
        }

        // Получаем задания вместе с категориями
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
        } else {
          console.log("Задания получены:", tasksData)

          // Преобразуем данные для удобства использования
          const processedTasks = tasksData.map((task) => ({
            ...task,
            category_name: task.task_categories?.name || "daily",
            // Если нет icon_url, устанавливаем иконку на основе категории
            icon_url: task.icon_url || getCategoryIcon(task.task_categories?.name),
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

  // Функция для получения иконки по категории
  const getCategoryIcon = (category) => {
    const iconMap = {
      daily: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/coin.png",
      partners: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/app.png",
      social: "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/share.png",
    }

    return (
      iconMap[category] || "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/task.png"
    )
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

