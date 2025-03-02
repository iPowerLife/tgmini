"use client"

import { useState, useCallback, memo } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

const VerificationTimer = memo(({ timeLeft, onComplete }) => {
  const [remainingTime, setRemainingTime] = useState(timeLeft)

  useState(() => {
    if (remainingTime <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingTime, onComplete])

  return <div className="text-center text-gray-400">Проверка ({Math.ceil(remainingTime / 1000)}с)</div>
})

const TimeRemaining = memo(({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now
    return diff > 0 ? formatTimeRemaining(diff) : null
  })

  useState(() => {
    if (!timeLeft) return

    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(endDate)
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft(null)
        clearInterval(timer)
      } else {
        setTimeLeft(formatTimeRemaining(diff))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return null

  return (
    <motion.div
      className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-[#1a1225]/80 border border-purple-500/20 shadow-inner shadow-purple-900/10"
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: [0.5, 1, 0.5],
        transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
      }}
    >
      <span className="text-xs font-medium text-[#b4a2ff]">ОСТАЛОСЬ:</span>
      <span className="text-sm font-mono font-medium text-[#d4c5ff]">{timeLeft}</span>
    </motion.div>
  )
})

function formatTimeRemaining(diff) {
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const TaskCard = memo(({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 15000,
  })

  const handleExecuteTask = useCallback(async () => {
    try {
      if (task.is_expired) {
        alert("Время выполнения задания истекло")
        return
      }

      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) throw startError

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
      alert("Ошибка при выполнении задания: " + error.message)
    }
  }, [user.id, task.id, task.link, task.is_expired])

  const handleVerificationComplete = useCallback(async () => {
    try {
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError

      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
      })

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }
    } catch (error) {
      console.error("Ошибка при завершении верификации:", error)
      alert("Ошибка при завершении верификации: " + error.message)
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
      alert("Ошибка при получении награды: " + error.message)
    }
  }, [user.id, task.id, onBalanceUpdate, onTaskComplete])

  const renderButton = () => {
    if (task.is_completed) {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          Выполнено ✓
        </button>
      )
    }

    if (task.is_expired) {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          Время истекло
        </button>
      )
    }

    if (verificationState.isVerifying) {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          <VerificationTimer timeLeft={verificationState.timeLeft} onComplete={handleVerificationComplete} />
        </button>
      )
    }

    if (task.type === "limited") {
      return (
        <button
          onClick={handleExecuteTask}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#392b4d] to-[#251b35] hover:from-[#443357] hover:to-[#2b1e3d] rounded-lg border border-[#392b4d] transition-all duration-300 shadow-lg shadow-purple-900/20"
        >
          <span className="text-[#c4b5fd]">Выполнить</span>
          <div className="flex items-center gap-1">
            <span className="text-[#9d8cff]">{task.reward}</span>
            <span className="text-[#9d8cff]">💎</span>
          </div>
        </button>
      )
    }

    return (
      <button
        onClick={handleExecuteTask}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
      >
        <span className="text-white">Выполнить</span>
        <div className="flex items-center gap-1">
          <span className="text-blue-400">{task.reward}</span>
          <span className="text-blue-400">💎</span>
        </div>
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative overflow-hidden rounded-xl
        ${
          task.type === "limited"
            ? "bg-gradient-to-br from-[#392b4d] to-[#251b35] border-purple-500/20"
            : "bg-[#1542cb] border-blue-500/20"
        }
        border
      `}
    >
      <div className="p-4">
        <div className="task-header">
          <div className="task-info">
            <h3
              className={`
              text-base font-semibold
              ${
                task.type === "limited" && !task.is_completed
                  ? "bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent"
                  : "text-gray-100"
              }
            `}
            >
              {task.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          </div>
        </div>

        {task.type === "limited" && !task.is_completed && <TimeRemaining endDate={task.end_date} />}

        {renderButton()}
      </div>
    </motion.div>
  )
})

