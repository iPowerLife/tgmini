"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [taskStates, setTaskStates] = useState({}) // { taskId: { status: 'initial' | 'verifying' | 'completed', timeLeft: number } }

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      // Загружаем статусы заданий
      const { data: userTasks, error: userTasksError } = await supabase
        .from("user_tasks")
        .select("task_id, status, verification_started_at")
        .eq("user_id", user.id)

      if (userTasksError) throw userTasksError

      // Обновляем состояния заданий
      const newTaskStates = {}
      userTasks?.forEach((userTask) => {
        if (userTask.status === "in_progress") {
          const verificationTime = new Date(userTask.verification_started_at).getTime()
          const now = Date.now()
          const timeLeft = Math.max(0, 15000 - (now - verificationTime))

          newTaskStates[userTask.task_id] = {
            status: timeLeft > 0 ? "verifying" : "completed",
            timeLeft,
          }
        }
      })

      setTaskStates(newTaskStates)
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

  // Обработчик для кнопки "Выполнить"
  const handleExecuteTask = async (task) => {
    try {
      // Начинаем задание
      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) throw startError

      // Обновляем состояние задания
      setTaskStates((prev) => ({
        ...prev,
        [task.id]: { status: "verifying", timeLeft: 15000 },
      }))

      // Открываем ссылку в новом окне
      window.open(task.link, "_blank")

      // Запускаем таймер
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
      console.error("Ошибка при выполнении задания:", error)
      alert("Ошибка при выполнении задания: " + error.message)
    }
  }

  // Обработчик для кнопки "Получить"
  const handleClaimReward = async (task) => {
    try {
      // Завершаем задание
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError

      // Получаем награду
      const { error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) throw rewardError

      // Обновляем список заданий
      await loadTasks()
    } catch (error) {
      console.error("Ошибка при получении награды:", error)
      alert("Ошибка при получении награды: " + error.message)
    }
  }

  // Функция для рендера кнопки действия
  const renderActionButton = (task) => {
    const taskState = taskStates[task.id]

    if (!taskState || taskState.status === "initial") {
      return (
        <button className="task-button execute-button" onClick={() => handleExecuteTask(task)}>
          Выполнить
        </button>
      )
    }

    if (taskState.status === "verifying") {
      return (
        <button className="task-button verify-button" disabled>
          Проверка ({Math.ceil(taskState.timeLeft / 1000)}с)
        </button>
      )
    }

    if (taskState.status === "completed") {
      return (
        <button className="task-button claim-button" onClick={() => handleClaimReward(task)}>
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

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.type === activeTab
  })

  return (
    <div className="tasks-page">
      {/* Вкладки */}
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

      {/* Список заданий */}
      <div className="tasks-list">
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <div className="task-info">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
              </div>
              <div className="task-reward">
                <span>{task.reward}</span>
                <span className="reward-icon">💎</span>
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

