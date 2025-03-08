"use client"

import { useState, memo } from "react"
import { Check } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 15000,
  })

  // Получаем иконку задания
  const getTaskIcon = () => {
    const title = task.title.toLowerCase()
    const type = task.type?.toLowerCase() || ""

    if (type === "video") return "/icons/youtube-icon.png"
    if (type === "social") {
      if (title.includes("telegram")) return "/icons/telegram-icon.png"
      if (title.includes("twitter") || title.includes("x ")) return "/icons/x-icon.png"
      return "/icons/share-icon.png"
    }
    if (type === "premium") return "/icons/vip-icon.png"
    if (type === "app") return "/icons/game-icon.png"
    if (type === "quiz") return "/icons/task-icon.png"

    // Определяем по названию
    if (title.includes("telegram")) return "/icons/telegram-icon.png"
    if (title.includes("twitter") || title.includes("x")) return "/icons/x-icon.png"
    if (title.includes("видео")) return "/icons/youtube-icon.png"
    if (title.includes("игра") || title.includes("app")) return "/icons/game-icon.png"
    if (title.includes("бонус")) return "/icons/coin.png"

    return "/icons/task-icon.png"
  }

  return (
    <div className="flex items-center bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Иконка задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          <img
            src={getTaskIcon() || "/placeholder.svg"}
            alt={task.title}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.target.src = "/icons/task-icon.png"
            }}
          />
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-gray-900 text-sm font-medium">{task.title}</div>
        <div className="flex items-center mt-1">
          <img src="/icons/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
          <span className="text-blue-500 font-bold text-sm">+{task.reward}</span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pr-3">
        {task.is_completed ? (
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Check className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <button
            className={`
              px-5 py-2 rounded-full font-medium transition-all
              ${
                task.is_completed
                  ? "bg-gray-100 text-gray-400"
                  : verificationState.isVerifying
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-500 hover:bg-blue-400 text-white shadow-sm"
              }
            `}
          >
            {task.is_completed ? "Done" : verificationState.isVerifying ? "Verifying..." : "Go"}
          </button>
        )}
      </div>
    </div>
  )
})

TaskCard.displayName = "TaskCard"

