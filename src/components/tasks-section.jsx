"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "./task-card"

export function TasksSection({ user, tasks, categories, onBalanceUpdate, onTaskComplete }) {
  const [activeTab, setActiveTab] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])
  const [categoryIds, setCategoryIds] = useState({})

  // Инициализируем соответствие между именами категорий и их ID
  useEffect(() => {
    if (!categories) return

    // Создаем обратное соответствие: имя категории -> id
    const nameToId = {}
    Object.entries(categories).forEach(([id, name]) => {
      nameToId[name] = Number.parseInt(id)
    })

    setCategoryIds(nameToId)
    console.log("Соответствие имен категорий и ID:", nameToId)
  }, [categories])

  // Фильтруем задания при изменении активной вкладки или списка заданий
  useEffect(() => {
    if (!tasks || tasks.length === 0 || !categoryIds || Object.keys(categoryIds).length === 0) {
      setFilteredTasks([])
      return
    }

    console.log("Активная вкладка:", activeTab)
    console.log("ID категории для вкладки:", categoryIds[activeTab])

    // Фильтруем задания по ID категории
    const filtered = tasks.filter((task) => {
      const taskCategoryId = task.category_id
      const tabCategoryId = categoryIds[activeTab]

      console.log(`Задание ${task.id} (${task.title}) - category_id: ${taskCategoryId}, требуемый ID: ${tabCategoryId}`)

      return taskCategoryId === tabCategoryId
    })

    console.log("Отфильтрованные задания:", filtered)
    setFilteredTasks(filtered)
  }, [activeTab, tasks, categoryIds])

  return (
    <div className="min-h-[100vh] pb-[70px]">
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">All Tasks</h1>
        <p className="text-gray-400 text-center text-sm">Small tasks, big rewards! Earn AP and level up your game.</p>
      </div>

      {/* Отладочная информация */}
      <div className="px-4 mb-4 text-xs text-gray-500">
        <p>Всего заданий: {tasks.length}</p>
        <p>Отфильтровано: {filteredTasks.length}</p>
        <p>Активная вкладка: {activeTab}</p>
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
                    ? "bg-[#2A3142] text-white shadow-md"
                    : "text-gray-400 hover:text-gray-300 hover:bg-[#2A3142]/50"
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
          <div className="text-center py-10 text-gray-400">
            <p>Нет доступных заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  )
}

