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
        <button className="completed-button" disabled>
          Выполнено ✓
        </button>
      )
    }

    const taskState = taskStates[task.id]

    if (!taskState || taskState.status === "initial") {
      return (
        <button className="execute-button" onClick={() => handleExecuteTask(task)}>
          Выполнить
          <span className="reward">
            {task.reward}
            <span className="reward-icon">💎</span>
          </span>
        </button>
      )
    }

    if (taskState.status === "verifying") {
      return (
        <button className="verify-button" disabled>
          Проверка ({Math.ceil(taskState.timeLeft / 1000)}с)
        </button>
      )
    }

    if (taskState.status === "completed" || task.user_status === "completed") {
      return (
        <button className="claim-button" onClick={() => handleClaimReward(task)}>
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
      // ��начала сортируем по статусу выполнения
      if (a.is_completed && !b.is_completed) return 1
      if (!a.is_completed && b.is_completed) return -1
      // Затем по времени создания (новые сверху)
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
                <h3 className="task-title">{task.title}</h3>
                {task.type === "limited" && (
                  <div className="flex items-center justify-center mt-3 mb-4">
                    <div
                      style={{
                        background: "linear-gradient(to right, rgba(17, 17, 17, 0.95), rgba(24, 24, 27, 0.95))",
                        padding: "8px 16px",
                        borderRadius: "9999px",
                        border: "1px solid rgba(147, 51, 234, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 0 15px rgba(147, 51, 234, 0.1)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        style={{
                          color: "#a855f7",
                          animation: "pulse 2s infinite",
                          display: "inline-block",
                        }}
                      >
                        ⏳
                      </span>
                      <span
                        style={{
                          background: "linear-gradient(to right, #d8b4fe, #a855f7)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "10px",
                          fontWeight: "500",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: '"Orbitron", sans-serif',
                        }}
                      >
                        осталось
                      </span>
                      <span
                        style={{
                          background: "linear-gradient(to right, #38bdf8, #818cf8)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "14px",
                          fontWeight: "600",
                          fontFamily: '"Orbitron", sans-serif',
                        }}
                      >
                        {task.end_date ? formatTimeRemaining(task.end_date) : "10:00"}
                      </span>
                    </div>
                  </div>
                )}
                <p className="task-description">{task.description}</p>
              </div>
            </div>
            <div className="task-actions">{renderActionButton(task)}</div>
          </div>
        ))}

        {filteredTasks.length === 0 && <div className="no-tasks">В этой категории пока нет доступных заданий</div>}
      </div>
    </div>
  )
}

