"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"
import { Check } from "lucide-react"

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 15000,
  })

  const handleExecuteTask = useCallback(async () => {
    try {
      if (task.is_expired || task.is_completed) {
        return
      }

      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) throw startError

      // Сохраняем время начала верификации
      const verificationStartTime = Date.now()
      localStorage.setItem(`task_verification_${task.id}`, verificationStartTime.toString())

      setVerificationState({
        isVerifying: true,
        timeLeft: 15000,
      })

      if (task.link) {
        const tg = initTelegram()
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      }
    } catch (error) {
      console.error("Ошибка при выполнении:", error)
    }
  }, [user.id, task.id, task.link, task.is_expired, task.is_completed])

  const handleVerificationComplete = useCallback(async () => {
    try {
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError

      // Очищаем сохраненное время верификации
      localStorage.removeItem(`task_verification_${task.id}`)

      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
      })

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    } catch (error) {
      console.error("Ошибка при завершении верификации:", error)
    }
  }, [user.id, task.id, onTaskComplete])

  const handleClaimReward = useCallback(async () => {
    try {
      const { data: rewardData, error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) throw rewardError

      if (rewardData && onBalanceUpdate) {
        onBalanceUpdate(rewardData.new_balance)
      }

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    } catch (error) {
      console.error("Ошибка при получении награды:", error)
    }
  }, [user.id, task.id, onBalanceUpdate, onTaskComplete])

  useEffect(() => {
    // Проверяем сохраненное время начала верификации
    const savedStartTime = localStorage.getItem(`task_verification_${task.id}`)

    if (savedStartTime && task.user_status === "in_progress") {
      const startTime = Number.parseInt(savedStartTime)
      const now = Date.now()
      const elapsed = now - startTime
      const remainingTime = Math.max(15000 - elapsed, 0)

      if (remainingTime > 0) {
        setVerificationState({
          isVerifying: true,
          timeLeft: remainingTime,
        })
      } else {
        // Если время вышло, автоматически завершаем верификацию
        handleVerificationComplete()
      }
    }
  }, [task.id, task.user_status, handleVerificationComplete])

  // Определяем какую иконку показывать в зависимости от типа задания
  const getTaskIcon = () => {
    const title = task.title.toLowerCase()

    if (title.includes("telegram") || title.includes("ton") || title.includes("чат") || title.includes("канал")) {
      return "/icons/telegram-icon.png"
    } else if (title.includes("twitter") || title.includes("x") || title.includes("лайк") || title.includes("пост")) {
      return "/icons/x-icon.png"
    } else if (title.includes("видео") || title.includes("watch") || title.includes("youtube")) {
      return "/icons/youtube-icon.png"
    } else if (
      title.includes("игра") ||
      title.includes("play") ||
      title.includes("app") ||
      title.includes("приложение")
    ) {
      return "/icons/game-icon.png"
    } else if (title.includes("подпишись") || title.includes("follow") || title.includes("join")) {
      return "/icons/follow-icon.png"
    } else if (title.includes("поделись") || title.includes("share")) {
      return "/icons/share-icon.png"
    } else if (title.includes("vip") || title.includes("премиум") || title.includes("premium")) {
      return "/icons/vip-icon.png"
    } else if (title.includes("бонус") || title.includes("bonus") || title.includes("ежедневн")) {
      return "/icons/coin.png"
    } else {
      // Дефолтная иконка
      return "/icons/task-icon.png"
    }
  }

  // Получаем текст кнопки
  const getButtonText = () => {
    if (task.is_completed) {
      return "Completed"
    }

    if (verificationState.isVerifying) {
      return `Verifying... ${Math.ceil(verificationState.timeLeft / 1000)}s`
    }

    if (task.user_status === "completed" && !task.reward_claimed) {
      return "Claim"
    }

    const title = task.title.toLowerCase()
    if (title.includes("watch") || title.includes("видео")) {
      return "Watch"
    }

    return "Go"
  }

  // Определяем, должна ли кнопка быть активной
  const isButtonActive = () => {
    if (task.is_completed || task.is_expired) {
      return false
    }

    if (verificationState.isVerifying) {
      return false
    }

    return true
  }

  // Определяем действие для кнопки
  const getButtonAction = () => {
    if (task.user_status === "completed" && !task.reward_claimed) {
      return handleClaimReward
    }

    return handleExecuteTask
  }

  // Форматируем сумму награды
  const formatReward = (reward) => {
    const num = Number.parseInt(reward, 10)
    if (num >= 1000) {
      return `${Math.floor(num / 1000)} ${num % 1000 === 0 ? "" : "."} ${
        num % 1000 !== 0
          ? String(num % 1000)
              .padStart(3, "0")
              .substring(0, 1)
          : ""
      } ${"000".substring(0, String(num % 1000).padStart(3, "0").length - 1)}`
    }
    return reward
  }

  return (
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]">
      {/* Иконка задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142]">
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
        <div className="text-white text-sm font-medium">{task.title}</div>
        <div className="flex items-center mt-1">
          <img src="/icons/coin.png" alt="Coin" className="w-4 h-4 mr-1" />
          <span className="text-blue-400 font-bold text-sm">+{formatReward(task.reward)}</span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pr-3">
        {task.is_completed ? (
          <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
            <Check className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <button
            onClick={isButtonActive() ? getButtonAction() : undefined}
            disabled={!isButtonActive()}
            className={`
              px-5 py-2 rounded-full font-medium transition-all
              ${
                task.is_completed
                  ? "bg-[#2A3142] text-gray-400"
                  : verificationState.isVerifying
                    ? "bg-[#2A3142] text-gray-300"
                    : "bg-blue-500 hover:bg-blue-400 text-white"
              }
            `}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  )
})

