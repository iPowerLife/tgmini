"use client"

import { useState, memo } from "react"
import { initTelegram } from "../utils/telegram"
import { Check } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.is_completed || false)
  const [verificationTime, setVerificationTime] = useState(task.verification_time || 15)
  const [imageError, setImageError] = useState(false)

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

  // Функция для получения запасного изображения по категории
  const getFallbackImage = () => {
    const category = task.category?.name || getCategoryById(task.category_id)

    switch (category) {
      case "daily":
        return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
      case "partners":
        return "https://cdn-icons-png.flaticon.com/512/2991/2991112.png"
      case "social":
        return "https://cdn-icons-png.flaticon.com/512/2504/2504941.png"
      default:
        return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
    }
  }

  // Функция для определения категории по ID
  const getCategoryById = (categoryId) => {
    if (!categoryId) return "daily"

    const categoryMap = {
      1: "daily",
      2: "partners",
      3: "social",
    }

    return categoryMap[categoryId] || "daily"
  }

  return (
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      {/* Изображение задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142]">
          <img
            src={imageError ? getFallbackImage() : task.icon_url || getFallbackImage()}
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
            <Check className="w-4 h-4 text-gray-400" />
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
})

TaskCard.displayName = "TaskCard"

