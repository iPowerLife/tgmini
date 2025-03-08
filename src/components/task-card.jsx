"use client"

import { useState, memo, useEffect } from "react"
import { Check, ImageIcon } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Отладочная информация
  useEffect(() => {
    console.log(`Задание ${task.id} (${task.title}):`, {
      icon_url: task.icon_url,
      type: task.type,
    })
  }, [task])

  const handleImageLoad = () => {
    console.log(`Изображение для задания ${task.id} успешно загружено:`, task.icon_url)
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    console.error(`Ошибка загрузки изображения для задания ${task.id}:`, task.icon_url)
    setImageError(true)
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
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142] relative">
          {task.icon_url ? (
            <>
              <img
                src={task.icon_url || "/placeholder.svg"}
                alt={task.title}
                className={`w-10 h-10 object-contain ${imageError ? "hidden" : ""}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                  <span className="text-[8px] text-gray-400 absolute bottom-0 left-0 right-0 text-center">Ошибка</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-500" />
              <span className="text-[8px] text-gray-400 absolute bottom-0 left-0 right-0 text-center">Нет URL</span>
            </div>
          )}
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
        <div className="flex items-center mt-1">
          <span className="text-blue-400 font-bold text-sm">+{task.reward}</span>
        </div>
        {/* Отображаем URL для отладки */}
        <div className="text-[8px] text-gray-500 truncate mt-1">{task.icon_url || "Нет URL"}</div>
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

