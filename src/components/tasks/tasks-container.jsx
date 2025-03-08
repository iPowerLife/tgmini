"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "./task-card"

export function TasksContainer({ tasks, user, onTaskComplete, onBalanceUpdate }) {
  const [activeTab, setActiveTab] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([])
      return
    }

    // Фильтруем задания по категории
    const filtered = tasks.filter((task) => {
      // Используем поле category, если оно есть, иначе проверяем category_id
      const taskCategory = task.category?.name || getCategoryById(task.category_id)
      return taskCategory === activeTab
    })

    setFilteredTasks(filtered)
  }, [activeTab, tasks])

  // Функция для определения категории по ID
  const getCategoryById = (categoryId) => {
    if (!categoryId) return "daily"

    const categoryMap = {
      1: "daily",
      2: "partners",
      3: "social",
    }

    return categoryMap[categoryId] || "daily"
  }

  return (
    <div className="min-h-[100vh] pb-[70px]">
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">Задания</h1>
        <p className="text-gray-400 text-center text-sm">Выполняйте задания и получайте награды</p>
      </div>

      {/* Табы */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar bg-[#242838] rounded-lg p-1">
          {["daily", "partners", "social"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-1
                ${activeTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:text-gray-300"}
              `}
            >
              {tab === "daily" ? "Ежедневные" : tab === "partners" ? "Партнеры" : "Социальные"}
            </button>
          ))}
        </div>
      </div>

      {/* Список заданий */}
      <div className="px-4 space-y-3 pb-24">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              onBalanceUpdate={onBalanceUpdate}
              onTaskComplete={onTaskComplete}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Нет доступных заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  )
}

