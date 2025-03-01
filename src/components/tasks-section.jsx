"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

const formatTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return "Время истекло"

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TasksSection({ user, onBalanceUpdate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [taskStates, setTaskStates] = useState({})

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasks(data?.tasks || [])
      console.log(
        "Task data:",
        data?.tasks?.map((t) => ({ id: t.id, type: t.type, end_date: t.end_date })),
      )
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Ошибка загрузки заданий: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadTasks()
    }
  }, [user?.id, loadTasks])

  // Add timer update effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update timers
      setTasks((prevTasks) => [...prevTasks])
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleExecuteTask = async (task) => {
    try {
      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) throw startError

      setTaskStates((prev) => ({
        ...prev,
        [task.id]: { status: "verifying", timeLeft: 15000 },
      }))

      if (task.link) {
        const tg = initTelegram()
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      }

      const interval = setInterval(() => {
        setTaskStates((prev) => {
          const taskState = prev[task.id]
          if (!taskState || taskState.timeLeft <= 0) {
            clearInterval(interval)
            return prev
          }

          const newTimeLeft = taskState.timeLeft - 1000
          return {
            ...prev,
            [task.id]: {
              status: newTimeLeft > 0 ? "verifying" : "completed",
              timeLeft: newTimeLeft,
            },
          }
        })
      }, 1000)
    } catch (error) {
      console.error("Ошибка при выполнении:", error)
      alert("Ошибка при выполнении задания: " + error.message)
    }
  }

  const handleClaimReward = async (task) => {
    try {
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError

      const { data: rewardData, error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) throw rewardError

      // Обновляем баланс в родительском компоненте
      if (rewardData && onBalanceUpdate) {
        onBalanceUpdate(rewardData.new_balance)
      }

      // Обновляем список заданий
      await loadTasks()
    } catch (error) {
      console.error("Ошибка при получении награды:", error)
      alert("Ошибка при получении награды: " + error.message)
    }
  }

  const renderActionButton = (task) => {
    if (task.is_completed) {
      return (
        <button
          className="w-full py-2.5 px-4 rounded-lg bg-green-600/20 text-green-500 text-sm font-medium cursor-not-allowed"
          disabled
        >
          Выполнено ✓
        </button>
      )
    }

    const taskState = taskStates[task.id]

    if (!taskState || taskState.status === "initial") {
      return (
        <button
          onClick={() => handleExecuteTask(task)}
          className="w-full py-2.5 px-4 rounded-lg bg-blue-500/10 text-white text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-between"
        >
          <span>Выполнить</span>
          <span className="flex items-center gap-1">
            {task.reward}
            <span>💎</span>
          </span>
        </button>
      )
    }

    if (taskState.status === "verifying") {
      return (
        <button
          className="w-full py-2.5 px-4 rounded-lg bg-gray-700/50 text-gray-400 text-sm font-medium cursor-not-allowed"
          disabled
        >
          Проверка ({Math.ceil(taskState.timeLeft / 1000)}с)
        </button>
      )
    }

    if (taskState.status === "completed" || task.user_status === "completed") {
      return (
        <button
          onClick={() => handleClaimReward(task)}
          className="w-full py-2.5 px-4 rounded-lg bg-green-500/10 text-white text-sm font-medium hover:bg-green-500/20 transition-colors"
        >
          Получить
        </button>
      )
    }
  }

  if (loading) {
    return <div className="tasks-loading">Загрузка заданий...</div>
  }

  if (error) {
    return <div className="tasks-error">{error}</div>
  }

  const filteredTasks = tasks
    .filter((task) => {
      if (activeTab === "all") return true
      return task.type === activeTab
    })
    .sort((a, b) => {
      // Сначала сортируем по статусу выполнения
      if (a.is_completed && !b.is_completed) return 1
      if (!a.is_completed && b.is_completed) return -1
      // Затем по времени создания (новые сверху)
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <div className="tasks-page">
      <div className="mb-4 flex gap-2 bg-[#1a1b1e] p-1 rounded-xl">
        <button
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${activeTab === "all" ? "bg-blue-500/20 text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("all")}
        >
          Все
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${activeTab === "basic" ? "bg-blue-500/20 text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("basic")}
        >
          Базовые
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${activeTab === "limited" ? "bg-blue-500/20 text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("limited")}
        >
          Лимит
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${activeTab === "achievement" ? "bg-blue-500/20 text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("achievement")}
        >
          Достижения
        </button>
      </div>

      <div className="tasks-list space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`bg-[#1a1b1e] rounded-xl p-4 ${task.is_completed ? "opacity-70" : ""}`}>
            <div className="mb-2">
              <div className="flex flex-col">
                <h3 className="text-white text-base font-medium mb-2">{task.title}</h3>
                {task.type === "limited" && (
                  <div className="flex flex-col items-center mt-1 mb-3">
                    <svg
                      className="w-12 h-12 text-white mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="text-[11px] uppercase tracking-wider text-gray-400">
                      ОСТАЛОСЬ: {task.end_date ? formatTimeRemaining(task.end_date) : "10:00"}
                    </span>
                  </div>
                )}
                <p className="text-gray-400 text-sm">{task.description}</p>
              </div>
            </div>
            <div className="flex">{renderActionButton(task)}</div>
          </div>
        ))}

        {filteredTasks.length === 0 && <div className="no-tasks">В этой категории пока нет доступных заданий</div>}
      </div>
    </div>
  )
}

