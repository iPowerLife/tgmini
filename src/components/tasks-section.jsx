"use client"

import { useState } from "react"
import { TasksList } from "./tasks-list"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState({
    basic: [],
    limited: [],
    achievement: [],
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ... остальные функции без изменений ...

  if (loading) {
    return <div className="text-xs text-gray-400 text-center py-4">Загрузка заданий...</div>
  }

  if (error) {
    return <div className="text-xs text-red-400 text-center py-4">{error}</div>
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="mb-4">
        <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">
          Задания
        </h1>
        <p className="text-xs text-gray-400">Выполняйте задания и получайте награды</p>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-900/50 p-0.5 rounded-lg backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
            activeTab === "basic"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
              : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
          }`}
        >
          Основные
        </button>
        <button
          onClick={() => setActiveTab("limited")}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
            activeTab === "limited"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
              : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
          }`}
        >
          Лимитированные
        </button>
        <button
          onClick={() => setActiveTab("achievement")}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
            activeTab === "achievement"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
              : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
          }`}
        >
          Достижения
        </button>
      </div>

      <TasksList tasks={tasks[activeTab]} type={activeTab} user={user} />
    </div>
  )
}

