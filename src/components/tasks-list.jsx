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

  if (!Array.isArray(tasks)) {
    return null
  }

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-400">
          {type === "limited"
            ? "Сейчас нет доступных лимитированных заданий"
            : type === "achievement"
              ? "Нет доступных достижений"
              : "Нет доступных заданий"}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="bg-gray-900/50 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-base text-white font-medium">{task.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-blue-400">{task.reward} 💎</span>
            </div>

            {!task.user_status && (
              <div className="flex gap-2">
                {task.link && (
                  <button
                    onClick={() => window.open(task.link, "_blank")}
                    disabled={processingTasks[task.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-sm text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Перейти
                  </button>
                )}
                <button
                  onClick={() => startTask(task.id)}
                  disabled={processingTasks[task.id]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-sm text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Начать
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {task.user_status === "active" && verificationTimers[task.id] === 0 && (
              <button
                onClick={() => completeTask(task.id)}
                disabled={processingTasks[task.id]}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-sm text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Завершить
              </button>
            )}

            {task.user_status === "completed" && !task.reward_claimed && (
              <button
                onClick={() => claimReward(task.id)}
                disabled={processingTasks[task.id]}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-sm text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Получить награду
              </button>
            )}
          </div>

          {task.user_status === "active" && verificationTimers[task.id] > 0 && (
            <div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${(verificationTimers[task.id] / 15) * 100}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-1">Проверка: {verificationTimers[task.id]} сек</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

