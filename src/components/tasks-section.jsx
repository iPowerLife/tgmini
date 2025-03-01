"use client"

import { useState, useCallback } from "react"
import { supabase } from "../lib/supabaseClient" // Import supabase

// Обновляем функцию форматирования времени с добавлением отладки
const formatTimeRemaining = (endDate) => {
  if (!endDate) {
    console.log("No end_date provided")
    return "Нет времени"
  }

  const now = new Date()
  const end = new Date(endDate)
  console.log("Formatting time:", { endDate, now, end })

  const diff = end - now

  if (diff <= 0) return "Время истекло"

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// В функции loadTasks добавляем логирование
const loadTasks = useCallback(async (user, setTasks) => {
  const [loading, setLoading] = useState(false) // Declare loading
  const [error, setError] = useState(null) // Declare error
  try {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.rpc("get_available_tasks", {
      user_id_param: user.id,
    })

    if (error) throw error

    // Добавляем отладочный вывод
    console.log("Loaded tasks:", data?.tasks)

    // Проверяем формат end_date для каждого задания
    data?.tasks?.forEach((task) => {
      if (task.type === "limited") {
        console.log(`Task ${task.id} end_date:`, task.end_date)
      }
    })

    setTasks(data?.tasks || [])
  } catch (err) {
    console.error("Error loading tasks:", err)
    setError("Ошибка загрузки заданий: " + err.message)
  } finally {
    setLoading(false)
  }
}, [])

// В renderTaskButton обновляем отображение времени
const renderTaskButton = (task, handleExecuteTask) => {
  if (task.type === "limited") {
    console.log("Rendering limited task:", task)
    return (
      <button
        onClick={() => handleExecuteTask(task)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              color: "#a855f7",
              animation: "pulse 2s infinite",
            }}
          >
            ⏳
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "500",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: '"Orbitron", sans-serif',
              background: "linear-gradient(to right, #e879f9, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
            }}
          >
            осталось:
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: '"Orbitron", sans-serif',
              background: "linear-gradient(to right, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
            }}
          >
            {task.end_date ? formatTimeRemaining(task.end_date) : "Нет времени"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white">Выполнить</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">{task.reward}</span>
            <span className="text-blue-400">💎</span>
          </div>
        </div>
      </button>
    )
  }
}

export { loadTasks, renderTaskButton }

