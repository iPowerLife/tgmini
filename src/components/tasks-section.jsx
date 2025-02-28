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
    <div className="flex-1 flex flex-col bg-[#0f172a]">
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-[17px] font-semibold text-white">Задания</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Выполняйте задания и получайте награды</p>
      </div>

      <div className="px-2">
        <div className="flex gap-1 p-1 bg-[#1e293b]/80 rounded-xl mx-3">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              activeTab === "basic"
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            Основные
          </button>
          <button
            onClick={() => setActiveTab("limited")}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              activeTab === "limited"
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            Лимитированные
          </button>
          <button
            onClick={() => setActiveTab("achievement")}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              activeTab === "achievement"
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            Достижения
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-20">
        <TasksList tasks={tasks[activeTab]} type={activeTab} user={user} />
      </div>
    </div>
  )
}

