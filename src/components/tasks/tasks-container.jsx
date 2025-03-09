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

  // Изменяем возвращаемый JSX
  return (
    <div className="pb-[70px]">
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

