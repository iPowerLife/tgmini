"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

const VerificationTimer = memo(({ timeLeft, onComplete }) => {
  const [remainingTime, setRemainingTime] = useState(timeLeft)

  useEffect(() => {
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

  useEffect(() => {
    setRemainingTime(timeLeft)
  }, [timeLeft])

  return <div className="text-center text-gray-400">Проверка ({Math.ceil(remainingTime / 1000)}с)</div>
})

const TimeRemaining = memo(({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now
    return diff > 0 ? formatTimeRemaining(diff) : null
  })

  useEffect(() => {
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
  }, [endDate, timeLeft])

  if (!timeLeft) return null

  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
        padding: "6px 10px",
        borderRadius: "8px",
        background: "rgba(147, 51, 234, 0.1)",
        border: "1px solid rgba(147, 51, 234, 0.2)",
        backdropFilter: "blur(8px)",
      }}
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.02, 1],
        transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
      }}
    >
      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "rgba(243, 232, 255, 0.9)" }}>ОСТАЛОСЬ:</span>
      <span style={{ fontSize: "0.875rem", fontFamily: "monospace", fontWeight: 500, color: "#f3e8ff" }}>
        {timeLeft}
      </span>
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
  // Пропускаем рендеринг реферальных заданий
  if (task.type === "referral") {
    return null
  }
  // Добавляем логирование для отладки
  useEffect(() => {
    console.log("Task data:", {
      id: task.id,
      type: task.type,
      title: task.title,
      required_referrals: task.required_referrals,
      user_referrals: user.referral_count,
    })
  }, [task, user])

  const handleExecuteTask = useCallback(async () => {
    try {
      if (task.is_expired) {
        return
      }

      if (task.is_completed) {
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

  const renderButton = () => {
    const baseButtonStyle = {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 12px",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontWeight: 500,
      transition: "all 0.2s ease",
      border: "none",
      cursor: "pointer",
      outline: "none",
    }

    // Для реферальных заданий показываем особое состояние
    if (task.type === "referral") {
      const currentReferrals = user.referral_count || 0
      const requiredReferrals = task.required_referrals

      if (task.is_completed) {
        return (
          <button
            style={{
              ...baseButtonStyle,
              background: "rgba(31, 41, 55, 0.8)",
              border: "1px solid rgba(75, 85, 99, 0.5)",
              color: "rgba(156, 163, 175, 1)",
              cursor: "not-allowed",
            }}
            disabled
          >
            <span>Задание выполнено ✓</span>
          </button>
        )
      } else if (currentReferrals >= requiredReferrals && !task.reward_claimed) {
        return (
          <button
            onClick={handleClaimReward}
            style={{
              ...baseButtonStyle,
              background: "linear-gradient(to right, #059669, #10b981)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "white",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.1)",
            }}
          >
            <span>Забрать награду</span>
          </button>
        )
      } else {
        return (
          <button
            style={{
              ...baseButtonStyle,
              background: "rgba(31, 41, 55, 0.8)",
              border: "1px solid rgba(75, 85, 99, 0.5)",
              color: "rgba(156, 163, 175, 1)",
            }}
            disabled
          >
            <span>В процессе...</span>
          </button>
        )
      }
    }

    // Остальной код для не-реферальных заданий остается без изменений
    if (task.is_completed) {
      return (
        <button
          style={{
            ...baseButtonStyle,
            background: "rgba(31, 41, 55, 0.8)",
            border: "1px solid rgba(75, 85, 99, 0.5)",
            color: "rgba(156, 163, 175, 1)",
            cursor: "not-allowed",
          }}
          disabled
        >
          <span>Задание выполнено ✓</span>
        </button>
      )
    }

    if (task.is_expired) {
      return (
        <button
          style={{
            ...baseButtonStyle,
            background: "rgba(31, 41, 55, 0.8)",
            border: "1px solid rgba(75, 85, 99, 0.5)",
            color: "rgba(156, 163, 175, 1)",
            cursor: "not-allowed",
          }}
          disabled
        >
          <span>Задание недоступно</span>
        </button>
      )
    }

    if (verificationState.isVerifying) {
      return (
        <button
          style={{
            ...baseButtonStyle,
            background: "rgba(31, 41, 55, 0.9)",
            border: "1px solid rgba(75, 85, 99, 0.5)",
          }}
          disabled
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <VerificationTimer timeLeft={verificationState.timeLeft} onComplete={handleVerificationComplete} />
          </div>
        </button>
      )
    }

    if (task.user_status === "completed" && !task.reward_claimed) {
      return (
        <button
          onClick={handleClaimReward}
          style={{
            ...baseButtonStyle,
            background: "linear-gradient(to right, #059669, #10b981)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "white",
            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.1)",
          }}
        >
          <span>Забрать награду</span>
        </button>
      )
    }

    const buttonStyle =
      task.type === "limited"
        ? {
            ...baseButtonStyle,
            background: "linear-gradient(to right, #9333ea, #a855f7)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "white",
            boxShadow: "0 2px 4px rgba(147, 51, 234, 0.1)",
          }
        : {
            ...baseButtonStyle,
            background: "linear-gradient(to right, #2563eb, #3b82f6)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "white",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.1)",
          }

    return (
      <button
        onClick={handleExecuteTask}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow =
            task.type === "limited" ? "0 4px 6px rgba(147, 51, 234, 0.2)" : "0 4px 6px rgba(37, 99, 235, 0.2)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow =
            task.type === "limited" ? "0 2px 4px rgba(147, 51, 234, 0.1)" : "0 2px 4px rgba(37, 99, 235, 0.1)"
        }}
      >
        <span>Выполнить</span>
      </button>
    )
  }

  const renderReferralProgress = () => {
    if (task.type !== "referral") return null

    const currentReferrals = user.referral_count || 0
    const requiredReferrals = task.required_referrals

    console.log("Referral progress:", {
      taskTitle: task.title,
      current: currentReferrals,
      required: requiredReferrals,
    })

    const progress = Math.min((currentReferrals / requiredReferrals) * 100, 100)
    const displayProgress = Math.round(progress)

    return (
      <div style={{ marginTop: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <span>
            {currentReferrals} из {requiredReferrals}
          </span>
          <span>{displayProgress}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${displayProgress}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        marginBottom: "8px",
        padding: "8px",
        background:
          task.type === "referral"
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)"
            : task.type === "limited"
              ? "linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(126, 34, 206, 0.08) 100%)"
              : "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(29, 78, 216, 0.08) 100%)",
        border:
          task.type === "referral"
            ? "1px solid rgba(59, 130, 246, 0.1)"
            : task.type === "limited"
              ? "1px solid rgba(147, 51, 234, 0.1)"
              : "1px solid rgba(37, 99, 235, 0.1)",
        opacity: task.is_completed || task.is_expired ? 0.6 : 1,
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      {task.type === "limited" && !task.is_completed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(147, 51, 234, 0.03) 0%, transparent 50%, rgba(147, 51, 234, 0.03) 100%)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}
      <div style={{ padding: "4px" }}>
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              margin: 0,
              color:
                task.type === "limited" && !task.is_completed && !task.is_expired
                  ? "#f3e8ff"
                  : "rgba(255, 255, 255, 0.9)",
            }}
          >
            {task.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.875rem",
              color: task.type === "limited" ? "#f3e8ff" : "#dbeafe",
            }}
          >
            <span>{task.reward}</span>
            <span>💎</span>
          </div>
        </div>

        {task.type === "limited" && !task.is_completed && <TimeRemaining endDate={task.end_date} />}

        {renderButton()}
      </div>

      {/* Добавляем прогресс бар для реферальных заданий */}
      {renderReferralProgress()}
    </div>
  )
})

