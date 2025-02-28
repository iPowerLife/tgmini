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
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">
          {type === "limited"
            ? "Сейчас нет доступных лимитированных заданий"
            : type === "achievement"
              ? "Нет доступных достижений"
              : "Нет доступных заданий"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">{task.title}</h3>
          <p className="text-gray-400 mb-4">{task.description}</p>

          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-blue-400">{task.reward} 💎</span>
            </span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="flex items-center gap-1 text-gray-400 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Выполнили: {task.total_completions}
            </span>
          </div>

          {task.user_status === "active" && verificationTimers[task.id] > 0 && (
            <div className="mb-4">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${(verificationTimers[task.id] / 15) * 100}%` }}
                />
              </div>
              <p className="text-center text-sm mt-2 text-gray-400">Проверка: {verificationTimers[task.id]} сек</p>
            </div>
          )}

          <div className="flex gap-2">
            {!task.user_status && (
              <>
                <button
                  onClick={() => window.open(task.link, "_blank")}
                  disabled={processingTasks[task.id]}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  <LinkIcon className="w-4 h-4" />
                  Перейти
                </button>
                <button
                  onClick={() => startTask(task.id)}
                  disabled={processingTasks[task.id]}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Начать
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {task.user_status === "active" && verificationTimers[task.id] === 0 && (
              <button
                onClick={() => completeTask(task.id)}
                disabled={processingTasks[task.id]}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Завершить
              </button>
            )}

            {task.user_status === "completed" && !task.reward_claimed && (
              <button
                onClick={() => claimReward(task.id)}
                disabled={processingTasks[task.id]}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
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

