"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

export const TaskCard = ({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 15000,
    canClaim: false,
  })

  // Обработчик выполнения задания
  const handleExecuteTask = useCallback(async () => {
    try {
      if (task.is_expired) {
        return
      }

      if (task.is_completed) {
        return
      }

      // Начинаем выполнение задания
      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) {
        console.error("Ошибка при начале задания:", startError)
        return
      }

      setVerificationState({
        isVerifying: true,
        timeLeft: 15000,
        canClaim: false,
      })

      // Открываем ссылку задания
      if (task.link) {
        const tg = initTelegram()
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, [user.id, task.id, task.link, task.is_expired, task.is_completed])

  // Обработчик получения награды
  const handleClaimReward = useCallback(async () => {
    try {
      // Завершаем задание
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) {
        throw completeError
      }

      // Получаем награду
      const { data: rewardData, error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) {
        throw rewardError
      }

      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
        canClaim: false,
      })

      if (onBalanceUpdate && rewardData?.new_balance) {
        onBalanceUpdate(rewardData.new_balance)
      }

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    } catch (error) {
      console.error(error)
    }
  }, [user.id, task.id, onBalanceUpdate, onTaskComplete])

  // Эффект для обработки таймера
  useEffect(() => {
    let timer
    if (verificationState.isVerifying && verificationState.timeLeft > 0) {
      timer = setInterval(() => {
        setVerificationState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1000,
        }))
      }, 1000)
    } else if (verificationState.timeLeft <= 0 && verificationState.isVerifying) {
      setVerificationState((prev) => ({
        ...prev,
        isVerifying: false,
        canClaim: true,
      }))
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [verificationState.isVerifying, verificationState.timeLeft])

  // Рендер кнопки в зависимости от состояния
  const renderButton = () => {
    if (task.is_completed) {
      return (
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400 cursor-not-allowed"
          disabled
        >
          <span>Задание выполнено ✓</span>
          <div className="task-reward opacity-50">
            <span>{task.reward}</span>
            <span>💎</span>
          </div>
        </button>
      )
    }

    if (task.is_expired) {
      return (
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400 cursor-not-allowed"
          disabled
        >
          <span>Задание недоступно</span>
          <div className="task-reward opacity-50">
            <span>{task.reward}</span>
            <span>💎</span>
          </div>
        </button>
      )
    }

    if (verificationState.isVerifying) {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-800/90 rounded-lg border border-gray-700/50"
          disabled
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span>Проверка... {Math.ceil(verificationState.timeLeft / 1000)}с</span>
          </div>
        </button>
      )
    }

    if (verificationState.canClaim) {
      return (
        <button
          onClick={handleClaimReward}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg border border-green-400/30 transition-all duration-300 shadow-lg shadow-green-900/20"
        >
          <span className="text-white/90 font-medium">Получить награду</span>
          <div className="flex items-center gap-1">
            <span className="text-green-100">{task.reward}</span>
            <span className="text-green-100">💎</span>
          </div>
        </button>
      )
    }

    const buttonClass =
      task.type === "limited"
        ? "w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg border border-purple-400/30 transition-all duration-300 shadow-lg shadow-purple-900/20"
        : "w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg border border-blue-400/30 transition-all duration-300 shadow-lg shadow-blue-900/20"

    return (
      <button onClick={handleExecuteTask} className={buttonClass}>
        <span className="text-white/90 font-medium">Выполнить</span>
        <div className="flex items-center gap-1">
          <span className={task.type === "limited" ? "text-purple-100" : "text-blue-100"}>{task.reward}</span>
          <span className={task.type === "limited" ? "text-purple-100" : "text-blue-100"}>💎</span>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl mb-1
        ${
          task.type === "limited"
            ? "bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-purple-900/80 border border-purple-500/20"
            : "bg-gradient-to-br from-blue-900/80 via-blue-800/80 to-blue-900/80 border border-blue-500/20"
        }
        ${task.is_completed || task.is_expired ? "opacity-60" : "hover:scale-[1.01]"}
        transform transition-all duration-300 backdrop-blur-sm
        shadow-lg ${task.type === "limited" ? "shadow-purple-900/20" : "shadow-blue-900/20"}
      `}
    >
      <div className="p-3">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white/90">{task.title}</h3>
          <p className="text-sm text-gray-400">{task.description}</p>
        </div>
        {renderButton()}
      </div>
    </div>
  )
}

