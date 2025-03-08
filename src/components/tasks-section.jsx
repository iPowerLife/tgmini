"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "./task-card"
import { TaskStats } from "./task-stats"

export function TasksSection({ user, tasks, onBalanceUpdate, onTaskComplete }) {
  const [activeTab, setActiveTab] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])

  useEffect(() => {
    if (!tasks) {
      setFilteredTasks([])
      return
    }

    // Логируем для отладки
    console.log("Все задания:", tasks)
    console.log("Активная вкладка:", activeTab)

    const filtered = tasks.filter((task) => {
      const category = task.task_categories?.name?.toLowerCase()
      console.log("Категория задания:", category) // Для отладки
      return category === activeTab
    })

    console.log("Отфильтрованные задания:", filtered) // Для отладки
    setFilteredTasks(filtered)
  }, [activeTab, tasks])

  return (
    <div className="min-h-[100vh] pb-[70px] bg-gradient-to-b from-white to-gray-50">
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">All Tasks</h1>
        <p className="text-gray-600 text-center text-sm">Small tasks, big rewards! Earn AP and level up your game.</p>
      </div>

      {/* Статистика заданий */}
      <div className="px-4 mb-6">
        <TaskStats tasks={tasks} />
      </div>

      {/* Табы */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["daily", "partners", "social"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeTab === tab
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          <div className="text-center py-10">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500">Нет доступных заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  )
}

