"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { QuizTask } from "./quiz-task"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [activeQuiz, setActiveQuiz] = useState(null)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
        })

        if (error) throw error

        setTasks(data || [])
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

  const startTask = async (taskId) => {
    try {
      const { data, error } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      // Перезагружаем список заданий после начала
      loadTasks()
    } catch (err) {
      console.error("Error starting task:", err)
      alert("Ошибка при начале задания")
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasks(data || [])
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Ошибка загрузки заданий")
    } finally {
      setLoading(false)
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
          <div key={task.id}>
            {activeQuiz?.taskId === task.id ? (
              <QuizTask
                task={task}
                user={user}
                onComplete={() => {
                  setActiveQuiz(null)
                  // Перезагружаем список заданий
                  loadTasks()
                }}
              />
            ) : (
              <div className="task-card">
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
                  <button
                    className="task-button start-button"
                    onClick={() => {
                      if (task.type === "achievement" && task.subtype === "quiz") {
                        // Для тестов показываем компонент QuizTask
                        setActiveQuiz({ taskId: task.id })
                      } else {
                        // Для обычных заданий используем существующую логику
                        startTask(task.id)
                      }
                    }}
                  >
                    Начать
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && <div className="no-tasks">В этой категории пока нет доступных заданий</div>}
      </div>
    </div>
  )
}

