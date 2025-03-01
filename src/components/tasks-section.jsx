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
    loadTasks()
  }, [user?.id])

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

  const startTask = async (taskId) => {
    try {
      const { data, error } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      loadTasks()
      return data
    } catch (err) {
      console.error("Error starting task:", err)
      alert("Ошибка при начале задания")
      return null
    }
  }

  // Обработка состояний загрузки и ошибок внутри app-container
  if (loading) {
    return (
      <div className="app-content">
        <div className="tasks-loading">Загрузка заданий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-content">
        <div className="tasks-error">{error}</div>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.type === activeTab
  })

  return (
    <div className="app-content">
      <div className="tasks-container">
        {/* Вкладки */}
        <div className="tasks-tabs">
          <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            Все
          </button>
          <button
            className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
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
            <div key={task.id} className="task-wrapper">
              {activeQuiz?.taskId === task.id ? (
                <div className="quiz-container">
                  <QuizTask
                    task={{
                      ...task,
                      user_task_id: activeQuiz.user_task_id || task.user_task_id,
                    }}
                    user={user}
                    onComplete={() => {
                      setActiveQuiz(null)
                      loadTasks()
                    }}
                  />
                </div>
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
                      onClick={async () => {
                        if (task.type === "achievement" && task.subtype === "quiz") {
                          const result = await startTask(task.id)
                          if (result?.success) {
                            setActiveQuiz({
                              taskId: task.id,
                              user_task_id: result.task_id,
                            })
                          }
                        } else {
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
    </div>
  )
}

