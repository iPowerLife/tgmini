"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"
import { Timer } from "lucide-react"

export function TasksSection({ user, onBalanceUpdate }) {
  const [tasks, setTasks] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("tasks").select("*")

      if (error) throw error

      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteTask = async (task) => {
    try {
      setLoading(true)

      // Проверка выполнения задания
      const { data: existingCompletion } = await supabase
        .from("task_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("task_id", task.id)
        .single()

      if (existingCompletion) {
        throw new Error("Вы уже выполнили это задание")
      }

      // Записываем выполнение
      const { error: completionError } = await supabase.from("task_completions").insert([
        {
          user_id: user.id,
          task_id: task.id,
        },
      ])

      if (completionError) throw completionError

      // Обновляем баланс
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: user.balance + task.reward })
        .eq("id", user.id)

      if (balanceError) throw balanceError

      // Обновляем UI
      onBalanceUpdate(user.balance + task.reward)

      const telegram = await initTelegram()
      telegram.showAlert(`Задание выполнено! +${task.reward} монет`)
    } catch (err) {
      setError(err.message)
      const telegram = await initTelegram()
      telegram.showAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "daily") return task.type === "daily"
    if (activeTab === "weekly") return task.type === "weekly"
    return true
  })

  return (
    <div className="tasks-page bg-[#1a1b1e] text-white min-h-screen p-4">
      {/* Tabs */}
      <div className="tasks-tabs bg-[#25262b] inline-flex p-1 rounded-md mb-6">
        <button
          className={`px-4 py-1.5 rounded ${
            activeTab === "all" ? "bg-[#1a1b1e] text-white" : "text-gray-400 hover:text-white"
          } transition-colors text-sm font-medium`}
          onClick={() => setActiveTab("all")}
        >
          Все
        </button>
        <button
          className={`px-4 py-1.5 rounded ${
            activeTab === "daily" ? "bg-[#1a1b1e] text-white" : "text-gray-400 hover:text-white"
          } transition-colors text-sm font-medium`}
          onClick={() => setActiveTab("daily")}
        >
          Ежедневные
        </button>
        <button
          className={`px-4 py-1.5 rounded ${
            activeTab === "weekly" ? "bg-[#1a1b1e] text-white" : "text-gray-400 hover:text-white"
          } transition-colors text-sm font-medium`}
          onClick={() => setActiveTab("weekly")}
        >
          Еженедельные
        </button>
      </div>

      {/* Tasks List */}
      <div className="tasks-list space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">В этой категории пока нет доступных заданий</div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-card bg-[#25262b] rounded-xl p-4 transition-all hover:bg-[#2c2d32]">
              <div className="task-header mb-4">
                <div className="task-info">
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  {task.type === "limited" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Осталось: {task.end_date}</span>
                    </div>
                  )}
                  <p className="text-gray-400">{task.description}</p>
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleExecuteTask(task)}
                  disabled={loading}
                >
                  {loading ? "Выполняется..." : "Выполнить"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

