"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState([])
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

        // Фильтруем только базовые задания
        const basicTasks = data.tasks.filter((task) => task.type === "basic")
        setTasks(basicTasks)
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white/50">Загрузка заданий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-white/50">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tasks-container max-w-lg mx-auto p-4">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white/90 font-medium mb-2">{task.title}</h3>
                <p className="text-white/70 text-sm">{task.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[#5b9af5] ml-4">
                <span className="text-lg font-medium">{task.reward}</span>
                <span className="text-sm">💎</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Выполнили: {task.total_completions}</span>
            </div>

            <div className="flex gap-3">
              {task.link && (
                <button className="task-button task-button-outline" onClick={() => window.open(task.link, "_blank")}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Перейти
                </button>
              )}
              <button className="task-button task-button-primary">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Начать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

