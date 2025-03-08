"use client"

import { useState, memo, useEffect, useRef } from "react"
import { Check, AlertCircle } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  // Обновляем константу для запасной иконки
  const DEFAULT_ICON = "https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/done.png"

  // Используем ref для доступа к DOM элементу изображения
  const imgRef = useRef(null)

  // Состояния
  const [iconSrc, setIconSrc] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [iconError, setIconError] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  // Принудительно загружаем изображение через JavaScript
  useEffect(() => {
    if (!task.icon_url) {
      console.log(`Задание ${task.id} - icon_url отсутствует, используем запасную иконку`)
      setIconSrc(DEFAULT_ICON)
      setDebugInfo("Нет URL")
      return
    }

    // Очищаем предыдущие ошибки
    setIconError(false)

    // Создаем новый объект Image для предзагрузки
    const img = new Image()

    // Обработчик успешной загрузки
    img.onload = () => {
      console.log(`Задание ${task.id} - изображение успешно загружено:`, task.icon_url)
      setIconSrc(task.icon_url)
      setDebugInfo("Загружено")
      setIconError(false)
    }

    // Обработчик ошибки загрузки
    img.onerror = (e) => {
      console.error(`Задание ${task.id} - ошибка загрузки изображения:`, task.icon_url, e)
      setIconSrc(DEFAULT_ICON)
      setDebugInfo("Ошибка загрузки")
      setIconError(true)
    }

    // Устанавливаем crossOrigin для предотвращения CORS ошибок
    img.crossOrigin = "anonymous"

    // Начинаем загрузку изображения
    img.src = task.icon_url

    // Выводим отладочную информацию
    setDebugInfo(`Загрузка: ${task.icon_url.substring(0, 20)}...`)

    // Очистка при размонтировании
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [task.id, task.icon_url])

  const handleExecuteTask = () => {
    if (isCompleted) return

    setIsVerifying(true)

    // Имитация выполнения задания
    setTimeout(() => {
      setIsVerifying(false)
      setIsCompleted(true)
      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    }, 2000)
  }

  // Функция для принудительного обновления иконки
  const forceRefreshIcon = () => {
    if (task.icon_url) {
      // Добавляем случайный параметр к URL для обхода кеширования
      const refreshedUrl = `${task.icon_url}?refresh=${Date.now()}`
      setIconSrc(refreshedUrl)
      setDebugInfo("Обновление...")
      setIconError(false)
    }
  }

  return (
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      {/* Иконка задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center relative">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142] relative">
          {iconError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-10">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          )}
          <img
            ref={imgRef}
            src={iconSrc || DEFAULT_ICON}
            alt={task.title}
            className="w-10 h-10 object-contain relative z-0"
            onClick={forceRefreshIcon}
          />
        </div>
        {/* Отладочная информация */}
        <div className="absolute bottom-0 left-0 right-0 text-[8px] text-center text-gray-400 bg-black/50 truncate">
          {debugInfo}
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
        <div className="flex items-center mt-1">
          <img src="/icons/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
          <span className="text-blue-400 font-bold text-sm">+{task.reward}</span>
        </div>
        {/* Отображаем URL иконки для отладки */}
        <div className="text-[8px] text-gray-500 truncate mt-1">
          {task.icon_url ? task.icon_url.substring(0, 30) + "..." : "Нет URL"}
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

