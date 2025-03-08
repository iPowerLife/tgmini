"use client"

import { useState } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

export function TaskCard({ task, user, onTaskComplete, onBalanceUpdate }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.is_completed || false)
  const [verificationTime, setVerificationTime] = useState(task.verification_time || 15)

  const handleExecuteTask = async () => {
    if (isCompleted || isVerifying) return

    setIsVerifying(true)

    // Если есть ссылка, открываем ее
    if (task.link) {
      const tg = initTelegram()
      if (tg) {
        tg.openLink(task.link)
      } else {
        window.open(task.link, "_blank")
      }
    }

    // Имитируем проверку выполнения задания
    const timer = setInterval(() => {
      setVerificationTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          completeTask()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const completeTask = async () => {
    setIsVerifying(false)
    setIsCompleted(true)

    try {
      // Обновляем статус задания в базе данных
      const { error } = await supabase.from("user_tasks").upsert({
        user_id: user?.id,
        task_id: task.id,
        status: "completed",
        completed_at: new Date().toISOString(),
      })

      if (error) throw error

      // Обновляем баланс пользователя
      if (user) {
        const newBalance = (user.balance || 0) + task.reward
        const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

        if (!updateError && onBalanceUpdate) {
          onBalanceUpdate(newBalance)
        }
      }

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    } catch (error) {
      console.error("Ошибка при выполнении задания:", error)
    }
  }

  // Получаем URL иконки с фолбэком
  const getIconUrl = () => {
    if (!task.icon_url) {
      return "https://via.placeholder.com/40"
    }

    if (task.icon_url.startsWith("http")) {
      return task.icon_url
    }

    return `${window.location.origin}${task.icon_url}`
  }

  return (
    <div className="bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      <div className="flex items-center p-4">
        {/* Иконка задания */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#2A3142] flex items-center justify-center">
          <img
            src={getIconUrl() || "/placeholder.svg"}
            alt={task.title}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/40"
            }}
          />
        </div>

        {/* Информация о задании */}
        <div className="ml-4 flex-1">
          <h3 className="text-white font-medium">{task.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{task.description}</p>
          <div className="flex items-center mt-2">
            <span className="text-blue-400 font-bold">+{task.reward}</span>
            <span className="text-gray-400 ml-1">монет</span>
          </div>
        </div>

        {/* Кнопка действия */}
        <div className="ml-4">
          {isCompleted ? (
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isVerifying ? (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <span className="text-xs text-gray-400">{verificationTime}с</span>
            </div>
          ) : (
            <button
              onClick={handleExecuteTask}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Выполнить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

