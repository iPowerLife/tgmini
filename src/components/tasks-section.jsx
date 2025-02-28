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

      <div className="px-4 mb-2">
        <div className="flex gap-2 p-1 bg-gray-800/50 backdrop-blur-sm rounded-xl">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "basic"
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/20 scale-[1.02]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Основные
          </button>
          <button
            onClick={() => setActiveTab("limited")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "limited"
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/20 scale-[1.02]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Лимитированные
          </button>
          <button
            onClick={() => setActiveTab("achievement")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "achievement"
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/20 scale-[1.02]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Достижения
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <TasksList tasks={tasks[activeTab]} type={activeTab} user={user} />
      </div>
    </div>
  )
}

