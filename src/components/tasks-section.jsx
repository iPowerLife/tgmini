"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [processingTasks, setProcessingTasks] = useState({})

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Загрузка заданий...")

      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      console.log("Ответ от сервера:", { data, error })

      if (error) throw error

      setTasks(data?.tasks || [])
      console.log("Задания загружены:", data?.tasks)
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

  const testTask = async (task) => {
    try {
      // Предотвращаем повторное нажатие
      if (processingTasks[task.id]) {
        console.log("Задание уже обрабатывается")
        return
      }

      setProcessingTasks((prev) => ({ ...prev, [task.id]: true }))

      // 1. Проверяем статус задания
      const { data: taskStatus, error: statusError } = await supabase
        .from("user_tasks")
        .select("status")
        .eq("user_id", user.id)
        .eq("task_id", task.id)
        .single()

      if (statusError && statusError.code !== "PGRST116") {
        throw statusError
      }

      // 2. Начинаем задание если оно еще не начато
      if (!taskStatus || taskStatus.status === "completed") {
        console.log("Начинаем задание:", task.title)
        const { data: startData, error: startError } = await supabase.rpc("start_task", {
          user_id_param: user.id,
          task_id_param: task.id,
        })

        if (startError) throw startError
        console.log("Задание начато успешно:", startData)
      } else {
        console.log("Задание уже в процессе, пропускаем start_task")
      }

      // 3. Ждем время верификации
      const waitTime = task.verification_time * 1000
      console.log(`Ожидаем ${task.verification_time} секунд...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))

      // 4. Завершаем задание
      console.log("Завершаем задание...")
      const { data: completeData, error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError
      console.log("Задание завершено успешно")

      // 5. Получаем награду
      console.log("Получаем награду...")
      const { data: rewardData, error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) throw rewardError
      console.log("Награда получена:", rewardData)

      // Обновляем список заданий
      await loadTasks()
    } catch (error) {
      console.error("Ошибка при тестировании:", error)
      alert("Ошибка при тестировании задания: " + error.message)
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [task.id]: false }))
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
            <div className="task-actions">
              {task.link && (
                <button className="task-button goto-button" onClick={() => window.open(task.link, "_blank")}>
                  Перейти
                </button>
              )}
              <button className="task-button start-button">Начать</button>
              <button
                className="task-button test-button"
                onClick={() => testTask(task)}
                disabled={processingTasks[task.id]}
              >
                {processingTasks[task.id] ? "Тестирование..." : "Тест"}
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && <div className="no-tasks">В этой категории пока нет доступных заданий</div>}
      </div>
    </div>
  )
}

