"use client"

import { useState } from "react"
import { getFallbackImage } from "../../utils/task-helpers"

export function TaskCard({ task, user, onBalanceUpdate, onTaskComplete }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.is_completed || false)
  const [verificationTime, setVerificationTime] = useState(task.verification_time || 15)
  const [imageError, setImageError] = useState(false)

  const handleExecuteTask = async () => {
    if (isCompleted || isVerifying) return

    setIsVerifying(true)

    // Если есть ссылка, открываем ее
    if (task.link) {
      try {
        const tg = window.Telegram?.WebApp
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      } catch (error) {
        console.error("Error opening link:", error)
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
      // Здесь можно добавить логику для обновления в базе данных
      if (onTaskComplete) {
        onTaskComplete(task.id)
      }

      // Обновляем баланс пользователя
      if (user && onBalanceUpdate) {
        const newBalance = (user.balance || 0) + task.reward
        onBalanceUpdate(newBalance)
      }
    } catch (error) {
      console.error("Ошибка при выполнении задания:", error)
    }
  }

  return (
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      {/* Изображение задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142]">
          <img
            src={imageError ? getFallbackImage(task) : task.icon_url || getFallbackImage(task)}
            alt={task.title}
            className="w-10 h-10 object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
        {task.description && <div className="text-gray-400 text-xs mt-1">{task.description}</div>}
        <div className="flex items-center mt-1">
          <span className="text-blue-400 font-bold text-sm">+{task.reward}</span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pr-3">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        ) : isVerifying ? (
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <span className="text-xs text-gray-400">{verificationTime}с</span>
          </div>
        ) : (
          <button
            onClick={handleExecuteTask}
            className="px-5 py-2 rounded-full font-medium transition-all bg-blue-500 hover:bg-blue-400 text-white shadow-md"
          >
            Выполнить
          </button>
        )}
      </div>
    </div>
  )
}

