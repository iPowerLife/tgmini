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
      className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm"
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.02, 1],
        transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
      }}
    >
      <span className="text-xs font-medium text-purple-200/90">ОСТАЛОСЬ:</span>
      <span className="text-sm font-mono font-medium text-purple-100">{timeLeft}</span>
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
          className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400 opacity-75"
          disabled
        >
          <span className="font-medium">Выполнено ✓</span>
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
          className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-800/90 rounded-lg border border-gray-700/50"
          disabled
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <VerificationTimer timeLeft={verificationState.timeLeft} onComplete={handleVerificationComplete} />
          </div>
        </button>
      )
    }

    if (task.type === "limited") {
      return (
        <button
          onClick={handleExecuteTask}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-400 hover:to-purple-500 rounded-lg border border-purple-400/30 transition-all duration-300 shadow-lg shadow-purple-900/20 group"
        >
          <span className="text-white/90 font-medium group-hover:text-white transition-colors">Выполнить</span>
          <div className="flex items-center gap-1">
            <span className="text-purple-100">{task.reward}</span>
            <span className="text-purple-100">💎</span>
          </div>
        </button>
      )
    }

    return (
      <button
        onClick={handleExecuteTask}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 rounded-lg border border-blue-400/30 transition-all duration-300 shadow-lg shadow-blue-900/20 group"
      >
        <span className="text-white/90 font-medium group-hover:text-white transition-colors">Выполнить</span>
        <div className="flex items-center gap-1">
          <span className="text-blue-100">{task.reward}</span>
          <span className="text-blue-100">💎</span>
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
      ? "bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90 border border-purple-500/20"
      : "bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90 border border-blue-500/20"
  }
  ${task.is_completed ? "opacity-60" : "hover:scale-[1.02]"}
  transform transition-all duration-300 backdrop-blur-sm
  shadow-lg ${task.type === "limited" ? "shadow-purple-900/20" : "shadow-blue-900/20"}
`}
    >
      {task.type === "limited" && !task.is_completed && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 animate-pulse-slow" />
      )}
      <div className="p-4">
        <div className="mb-3">
          <h3
            className={`
            text-lg font-semibold
            ${
              task.type === "limited" && !task.is_completed
                ? "bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 bg-clip-text text-transparent"
                : "text-white/90"
            }
          `}
          >
            {task.title}
          </h3>
          <p className="text-sm text-gray-300/80 mt-1">{task.description}</p>
        </div>

        {task.type === "limited" && !task.is_completed && <TimeRemaining endDate={task.end_date} />}

        {renderButton()}
      </div>
    </motion.div>
  )
})

