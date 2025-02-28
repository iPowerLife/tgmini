"use client"

import { useState } from "react"
import { ArrowRight, LinkIcon } from "lucide-react"
import { supabase } from "../supabase"

export function TasksList({ tasks, type, user }) {
  const [processingTasks, setProcessingTasks] = useState({})
  const [verificationTimers, setVerificationTimers] = useState({})

  const startTask = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      const timer = setInterval(() => {
        setVerificationTimers((prev) => {
          const timeLeft = (prev[taskId] || 15) - 1
          if (timeLeft <= 0) {
            clearInterval(timer)
            return { ...prev, [taskId]: 0 }
          }
          return { ...prev, [taskId]: timeLeft }
        })
      }, 1000)

      setVerificationTimers((prev) => ({ ...prev, [taskId]: 15 }))
    } catch (error) {
      console.error("Error starting task:", error)
      alert("Ошибка при начале выполнения задания")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  const completeTask = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      if (data.success) {
        alert("Задание успешно выполнено! Теперь вы можете получить награду.")
      } else if (data.remaining_seconds) {
        alert(`Подождите еще ${data.remaining_seconds} секунд`)
      }
    } catch (error) {
      console.error("Error completing task:", error)
      alert("Ошибка при выполнении задания")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  const claimReward = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      if (data.success) {
        alert(`Награда получена: ${data.reward} 💎`)
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
      alert("Ошибка при получении награды")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  if (!tasks.length) {
    return <div className="text-sm text-gray-400 text-center py-4">Нет доступных заданий</div>
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-900/70 transition-all duration-300 border border-gray-800/50 hover:border-blue-500/30"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">{task.title}</h3>
              <p className="text-xs text-gray-400">{task.description}</p>
            </div>
            <div className="flex items-center bg-blue-500/10 px-2 py-1 rounded-full">
              <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {task.reward} 💎
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span className="text-xs text-gray-500">Выполнили: {task.total_completions}</span>
            </div>
          </div>

          {task.user_status === "active" && verificationTimers[task.id] > 0 && (
            <div className="mb-3">
              <div className="h-1 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                  style={{ width: `${(verificationTimers[task.id] / 15) * 100}%` }}
                />
              </div>
              <p className="text-center text-xs mt-1 text-gray-500">Проверка: {verificationTimers[task.id]} сек</p>
            </div>
          )}

          <div className="flex gap-2">
            {!task.user_status && (
              <>
                <button
                  onClick={() => window.open(task.link, "_blank")}
                  disabled={processingTasks[task.id]}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-xs text-gray-300 hover:text-white transition-all duration-300 disabled:opacity-50 border border-gray-700/50"
                >
                  <LinkIcon className="w-3 h-3" />
                  Перейти
                </button>
                <button
                  onClick={() => startTask(task.id)}
                  disabled={processingTasks[task.id]}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-400 hover:text-blue-300 transition-all duration-300 disabled:opacity-50 border border-blue-500/20"
                >
                  Начать
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}

            {task.user_status === "active" && verificationTimers[task.id] === 0 && (
              <button
                onClick={() => completeTask(task.id)}
                disabled={processingTasks[task.id]}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-400 hover:text-blue-300 transition-all duration-300 disabled:opacity-50 border border-blue-500/20"
              >
                Завершить
              </button>
            )}

            {task.user_status === "completed" && !task.reward_claimed && (
              <button
                onClick={() => claimReward(task.id)}
                disabled={processingTasks[task.id]}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-xs text-blue-400 hover:text-blue-300 transition-all duration-300 disabled:opacity-50 border border-blue-500/20"
              >
                Получить награду 💎
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

