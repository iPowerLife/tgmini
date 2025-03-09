"use client"

import { useState, useEffect } from "react"
import { getFallbackImage } from "../../utils/task-helpers"

export function TaskCard({ task, user, onBalanceUpdate, onTaskComplete }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.is_completed || false)
  const [verificationTime, setVerificationTime] = useState(task.verification_time || 15)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Добавляем эффект для анимации при наведении
  useEffect(() => {
    return () => {
      // Очистка при размонтировании
    }
  }, [])

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

  // Функция для генерации случайного градиента на основе ID задания
  const getGradientStyle = () => {
    // Используем ID задания для создания уникального градиента
    const taskId = task.id || Math.floor(Math.random() * 1000)
    const hue1 = (taskId * 37) % 360 // Первый цвет
    const hue2 = (taskId * 73) % 360 // Второй цвет

    return {
      background: `linear-gradient(135deg, 
        rgba(${30 + (taskId % 20)}, ${41 + (taskId % 15)}, ${59 + (taskId % 20)}, 0.7), 
        rgba(${15 + (taskId % 15)}, ${23 + (taskId % 10)}, ${42 + (taskId % 15)}, 0.8))`,
      boxShadow: isHovered
        ? "0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.15)"
        : "0 4px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.1)",
      transition: "all 0.3s ease",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    }
  }

  // Стили для изображения
  const imageContainerStyle = {
    borderRadius: "12px",
    overflow: "hidden",
    background: "rgba(42, 49, 66, 0.7)",
    padding: "2px",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2) inset",
    transition: "all 0.3s ease",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
  }

  // Стили для кнопки
  const buttonStyle = {
    background: isHovered ? "linear-gradient(135deg, #4f46e5, #3b82f6)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
    boxShadow: isHovered ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "0 2px 6px rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s ease",
  }

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg"
      style={getGradientStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Изображение задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div style={imageContainerStyle}>
          <img
            src={imageError ? getFallbackImage(task) : task.icon_url || getFallbackImage(task)}
            alt={task.title}
            className="w-10 h-10 object-contain rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
        {task.description && <div className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</div>}
        <div className="flex items-center mt-1">
          <span className="text-blue-400 font-bold text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            +{task.reward}
          </span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pr-3">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-green-400"
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
            className="px-5 py-2 rounded-full font-medium transition-all text-white shadow-md"
            style={buttonStyle}
          >
            Выполнить
          </button>
        )}
      </div>
    </div>
  )
}

