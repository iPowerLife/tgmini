"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setDebugInfo("Загрузка данных...")

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
          setDebugInfo((prev) => prev + "\nОшибка получения пользователя")
        } else {
          setUser(userData)
          setDebugInfo((prev) => prev + "\nПользователь загружен")
        }

        // Получаем задания с icon_url
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("is_active", true)

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
          setDebugInfo((prev) => prev + "\nОшибка получения заданий")
        } else {
          console.log("Полученные задания (всего):", tasksData.length)
          setDebugInfo((prev) => prev + `\nЗаданий загружено: ${tasksData.length}`)

          // Проверяем наличие и формат icon_url в каждом задании
          const validTasks = []
          const invalidUrls = []

          tasksData.forEach((task) => {
            console.log(`Задание ${task.id} (${task.title}) - тип: ${task.type}, icon_url: ${task.icon_url}`)

            // Проверяем формат URL
            if (task.icon_url) {
              try {
                new URL(task.icon_url)
                validTasks.push(task)
              } catch (error) {
                console.error(`Задание ${task.id} - некорректный URL иконки:`, error.message)
                invalidUrls.push(task.id)

                // Исправляем некорректный URL
                if (task.icon_url.startsWith("/")) {
                  // Если URL начинается с /, добавляем базовый URL
                  task.icon_url = `https://tphsnmoitxericjvgwwn.supabase.co${task.icon_url}`
                } else {
                  // Иначе используем полный URL
                  task.icon_url = `https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/${task.icon_url}`
                }

                validTasks.push(task)
              }
            } else {
              // Если icon_url отсутствует, добавляем задание без изменений
              validTasks.push(task)
            }
          })

          setDebugInfo((prev) => prev + `\nВалидных URL: ${validTasks.length - invalidUrls.length}`)
          setDebugInfo((prev) => prev + `\nИсправлено URL: ${invalidUrls.length}`)

          setTasks(validTasks)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setDebugInfo((prev) => prev + `\nОшибка: ${error.message}`)
      } finally {
        setLoading(false)
        setDebugInfo((prev) => prev + "\nЗагрузка завершена")
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
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-400 rounded-full animate-spin mb-4" />
        <div className="text-xs text-gray-400 max-w-xs mx-auto whitespace-pre-line">{debugInfo}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <header className="px-4 py-3 flex items-center justify-between border-b border-[#2A3142]/30">
        <div className="flex items-center">
          <button className="text-gray-400 hover:text-white transition-colors">Закрыть</button>
        </div>
        <div className="text-xs text-gray-500">Заданий: {tasks.length}</div>
      </header>

      {/* Отладочная информация */}
      <div className="px-4 py-2 bg-black/30 text-[10px] text-gray-400 whitespace-pre-line">{debugInfo}</div>

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

