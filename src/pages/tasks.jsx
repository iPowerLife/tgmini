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

        // Получаем задания с icon_url
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("is_active", true)

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
        } else {
          console.log("Полученные задания (всего):", tasksData.length)

          // Проверяем наличие и формат icon_url в каждом задании
          tasksData.forEach((task) => {
            console.log(`Задание ${task.id} (${task.title}) - тип: ${task.type}, icon_url: ${task.icon_url}`)

            // Проверяем формат URL
            if (task.icon_url) {
              try {
                new URL(task.icon_url)
                console.log(`Задание ${task.id} - URL иконки валидный`)
              } catch (error) {
                console.error(`Задание ${task.id} - некорректный URL иконки:`, error.message)
              }
            }
          })

          setTasks(tasksData)
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

