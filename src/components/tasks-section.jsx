"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

const formatTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
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

  useEffect(() => {
    const timer = setInterval(() => {
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
            return {
              ...prev,
              [task.id]: { status: "completed", timeLeft: 0 },
            }
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

      if (rewardData && onBalanceUpdate) {
        onBalanceUpdate(rewardData.new_balance)
      }

      await loadTasks()
    } catch (error) {
      console.error("Ошибка при получении награды:", error)
      alert("Ошибка при получении награды: " + error.message)
    }
  }

  const renderTaskButton = (task) => {
    const taskState = taskStates[task.id]

    if (task.is_completed) {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          Выполнено ✓
        </button>
      )
    }

    if (taskState?.status === "completed") {
      return (
        <button
          onClick={() => handleClaimReward(task)}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600/80 rounded-lg border border-blue-500/50 hover:bg-blue-600/90 transition-colors text-white"
        >
          Получить
        </button>
      )
    }

    if (taskState?.status === "verifying") {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          Проверка ({Math.ceil(taskState.timeLeft / 1000)}с)
        </button>
      )
    }

    if (task.type === "limited") {
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

    return (
      <button
        onClick={() => handleExecuteTask(task)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
      >
        <span className="text-white">Выполнить</span>
        <div className="flex items-center gap-1">
          <span className="text-blue-400">{task.reward}</span>
          <span className="text-blue-400">💎</span>
        </div>
      </button>
    )
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
      if (a.is_completed && !b.is_completed) return 1
      if (!a.is_completed && b.is_completed) return -1
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <div className="tasks-page">
      <div className="tasks-tabs">
        <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          Все
        </button>
        <button className={`tab-button ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>
          Базовые
        </button>
        <button
          className={`tab-button ${activeTab === "limited" ? "active" : ""}`}
          onClick={() => setActiveTab("limited")}
        >
          Лимит
        </button>
        <button
          className={`tab-button ${activeTab === "achievement" ? "active" : ""}`}
          onClick={() => setActiveTab("achievement")}
        >
          Достижения
        </button>
      </div>
      <div className="tasks-list">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`}>
            <div className="task-header">
              <div className="task-info">
                <h3 className="task-title text-lg font-semibold text-white mb-4">{task.title}</h3>
              </div>
            </div>
            {renderTaskButton(task)}
          </div>
        ))}

        {filteredTasks.length === 0 && <div className="no-tasks">В этой категории пока нет доступных заданий</div>}
      </div>
    </div>
  )
}

