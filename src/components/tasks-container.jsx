"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "./task-card"

export function TasksContainer({ tasks, categories, user, onTaskComplete, onBalanceUpdate }) {
  const [activeCategory, setActiveCategory] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const filtered = tasks.filter((task) => task.category && task.category.name === activeCategory)
      setFilteredTasks(filtered)
    } else {
      setFilteredTasks([])
    }
  }, [tasks, activeCategory])

  return (
    <div>
      {/* Вкладки категорий */}
      <div className="flex overflow-x-auto no-scrollbar mb-6 bg-[#242838] rounded-lg p-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-1
              ${activeCategory === category.name ? "bg-blue-500 text-white" : "text-gray-400 hover:text-gray-300"}
            `}
          >
            {category.display_name}
          </button>
        ))}
      </div>

      {/* Список заданий */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              onTaskComplete={onTaskComplete}
              onBalanceUpdate={onBalanceUpdate}
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

