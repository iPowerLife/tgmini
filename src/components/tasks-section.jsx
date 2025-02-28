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

        data.tasks.forEach((task) => {
          groupedTasks[task.type].push(task)
        })

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Загрузка заданий...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Задания</h1>
        <p className="text-gray-400">Выполняйте задания и получайте награды</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "basic" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Основные
        </button>
        <button
          onClick={() => setActiveTab("limited")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "limited" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Лимитированные
        </button>
        <button
          onClick={() => setActiveTab("achievement")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "achievement" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Достижения
        </button>
      </div>

      <TasksList tasks={tasks[activeTab]} type={activeTab} user={user} />
    </div>
  )
}

