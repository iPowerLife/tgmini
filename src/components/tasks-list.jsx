"use client"

import { useState } from "react"
import { Clock, Trophy, LinkIcon, Timer, Gift, Users, CheckCircle2, ArrowRight } from "lucide-react"
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
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div className="text-center text-gray-400">
          <div className="mb-4 flex justify-center">
            {type === "limited" ? (
              <Clock className="h-12 w-12 text-indigo-500/50" />
            ) : type === "achievement" ? (
              <Trophy className="h-12 w-12 text-amber-500/50" />
            ) : (
              <CheckCircle2 className="h-12 w-12 text-emerald-500/50" />
            )}
          </div>
          <p className="text-lg font-medium mb-2 text-white">
            {type === "limited"
              ? "Сейчас нет доступных лимитированных заданий"
              : type === "achievement"
                ? "Нет доступных достижений"
                : "Нет доступных заданий"}
          </p>
          <p className="text-sm text-gray-500">Загляните позже, чтобы увидеть новые задания</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 animate-in fade-in-50 duration-500">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-800 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
        >
          {/* Фоновый градиент */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Контент */}
          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-indigo-400 transition-colors">
                  {task.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{task.description}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Gift className="w-5 h-5 text-indigo-400" />
                <span className="text-lg font-semibold text-white">{task.reward} 💎</span>
              </div>
            </div>

            {/* Дополнительная информация */}
            {task.type === "limited" && task.end_date && (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-3 rounded-lg bg-gray-900/50 border border-gray-800 mb-4">
                <Timer className="w-4 h-4 text-indigo-400" />
                <span>
                  Доступно до:{" "}
                  {new Date(task.end_date).toLocaleDateString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {task.type === "achievement" && (
              <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-white">Прогресс выполнения</span>
                  <span className="text-gray-400">0/100</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" />
                </div>
              </div>
            )}

            {task.user_status === "active" && verificationTimers[task.id] > 0 && (
              <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 mb-4">
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${(verificationTimers[task.id] / 15) * 100}%` }}
                  />
                </div>
                <p className="text-center text-sm mt-2 font-medium text-gray-400">
                  Проверка: {verificationTimers[task.id]} сек
                </p>
              </div>
            )}

            {/* Нижняя часть карточки */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>Выполнили: {task.total_completions}</span>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                {!task.user_status && (
                  <>
                    <button
                      onClick={() => window.open(task.link, "_blank")}
                      disabled={processingTasks[task.id]}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group/button"
                    >
                      <LinkIcon className="w-4 h-4 group-hover/button:-translate-y-0.5 transition-transform" />
                      Перейти
                    </button>
                    <button
                      onClick={() => startTask(task.id)}
                      disabled={processingTasks[task.id]}
                      className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group/button"
                    >
                      Начать
                      <ArrowRight className="w-4 h-4 group-hover/button:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}

                {task.user_status === "active" && verificationTimers[task.id] === 0 && (
                  <button
                    onClick={() => completeTask(task.id)}
                    disabled={processingTasks[task.id]}
                    className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Завершить
                  </button>
                )}

                {task.user_status === "completed" && !task.reward_claimed && (
                  <button
                    onClick={() => claimReward(task.id)}
                    disabled={processingTasks[task.id]}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group/button"
                  >
                    <Gift className="w-4 h-4 group-hover/button:scale-110 transition-transform" />
                    Получить награду
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

