"use client"

import { useState, useEffect } from "react"
import { TasksList } from "./tasks-list"
import { supabase } from "../supabase"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState({
    basic: [],
    limited: [],
    achievement: [],
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
        })

        if (error) throw error

        const groupedTasks = {
          basic: [],
          limited: [],
          achievement: [],
        }

        if (data.tasks) {
          data.tasks.forEach((task) => {
            if (groupedTasks[task.type]) {
              groupedTasks[task.type].push(task)
            }
          })
        }

        setTasks(groupedTasks)
      } catch (err) {
        console.error("Error loading tasks:", err)
        setError("Ошибка загрузки заданий")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadTasks()
    }
  }, [user?.id])

  if (!user?.id) {
    return null
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-gray-400">Загрузка заданий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3">
        <h1 className="text-lg font-medium text-white mb-1">Задания</h1>
        <p className="text-sm text-gray-400">Выполняйте задания и получайте награды</p>
      </div>

      <div className="px-4 flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "basic"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Основные
        </button>
        <button
          onClick={() => setActiveTab("limited")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "limited"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Лимитированные
        </button>
        <button
          onClick={() => setActiveTab("achievement")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "achievement"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Достижения
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <TasksList tasks={tasks[activeTab]} type={activeTab} user={user} />
      </div>
    </div>
  )
}

