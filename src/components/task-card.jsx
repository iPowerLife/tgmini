"use client"

import { useState, memo } from "react"
import { Check, Award, Video, FileQuestion, ExternalLink, Smartphone } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Функция для определения иконки на основе типа и названия задания
  const getTaskIcon = () => {
    const title = task.title?.toLowerCase() || ""
    const type = task.type?.toLowerCase() || ""

    // Хардкодированные иконки для разных типов заданий
    if (type === "video" || title.includes("видео")) {
      return <Video className="w-8 h-8 text-pink-500" />
    } else if (type === "quiz" || title.includes("опрос")) {
      return <FileQuestion className="w-8 h-8 text-purple-500" />
    } else if (type === "premium" || title.includes("премиум")) {
      return <Award className="w-8 h-8 text-amber-500" />
    } else if (type === "app" || title.includes("приложение")) {
      return <Smartphone className="w-8 h-8 text-green-500" />
    } else if (type === "social" || title.includes("поделись") || title.includes("подпишись")) {
      return <ExternalLink className="w-8 h-8 text-blue-500" />
    } else if (title.includes("бонус")) {
      return <Award className="w-8 h-8 text-amber-500" />
    } else {
      // Дефолтная иконка
      return <Award className="w-8 h-8 text-gray-400" />
    }
  }

  const handleExecuteTask = () => {
    if (isCompleted) return

    setIsVerifying(true)

    setTimeout(() => {
      setIsVerifying(false)
      setIsCompleted(true)
      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    }, 2000)
  }

  return (
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      {/* Иконка задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142]">
          {getTaskIcon()}
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
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
        ) : (
          <button
            onClick={handleExecuteTask}
            disabled={isVerifying || isCompleted}
            className={`
              px-5 py-2 rounded-full font-medium transition-all
              ${
                isCompleted
                  ? "bg-[#2A3142] text-gray-400"
                  : isVerifying
                    ? "bg-[#2A3142] text-gray-300"
                    : "bg-blue-500 hover:bg-blue-400 text-white shadow-md"
              }
            `}
          >
            {isCompleted ? "Done" : isVerifying ? "Verifying..." : "Go"}
          </button>
        )}
      </div>
    </div>
  )
})

TaskCard.displayName = "TaskCard"

