"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"

export const TaskCard = ({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 15000,
    taskStatus: null, // Добавляем отслеживание статуса
  })

  // Функция для проверки статуса задания
  const checkTaskStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("status")
        .eq("user_id", user.id)
        .eq("task_id", task.id)
        .single()

      if (error) {
        console.error("Ошибка при проверке статуса:", error)
        return null
      }

      console.log("Текущий статус задания:", data?.status)
      return data?.status
    } catch (error) {
      console.error("Ошибка при проверке статуса:", error)
      return null
    }
  }, [user.id, task.id])

  // Обработчик выполнения задания
  const handleExecuteTask = useCallback(async () => {
    try {
      console.log("Начинаем выполнение задания:", task.id)

      if (task.is_expired) {
        alert("Время выполнения задания истекло")
        return
      }

      if (task.is_completed) {
        alert("Задание уже выполнено")
        return
      }

      // Проверяем текущий статус перед началом
      const currentStatus = await checkTaskStatus()
      console.log("Статус перед началом:", currentStatus)

      if (currentStatus === "in_progress") {
        console.log("Задание уже выполняется")
        setVerificationState({
          isVerifying: true,
          timeLeft: 15000,
          taskStatus: "in_progress",
        })
        return
      }

      // Начинаем выполнение задания
      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) {
        console.error("Ошибка при начале задания:", startError)
        alert(`Ошибка при начале задания: ${startError.message}`)
        return
      }

      console.log("Задание успешно начато")

      setVerificationState({
        isVerifying: true,
        timeLeft: 15000,
        taskStatus: "in_progress",
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
      console.error("Ошибка при выполнении:", error)
      alert(`Ошибка при выполнении задания: ${error.message}`)
    }
  }, [user.id, task.id, task.link, task.is_expired, task.is_completed, checkTaskStatus])

  // Обработчик завершения верификации
  const handleVerificationComplete = useCallback(async () => {
    try {
      console.log("Начинаем завершение верификации")

      // Проверяем текущий статус
      const currentStatus = await checkTaskStatus()
      console.log("Текущий статус при завершении:", currentStatus)

      if (currentStatus !== "in_progress") {
        throw new Error("Неверный статус задания: " + currentStatus)
      }

      // Завершаем задание
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) {
        throw completeError
      }

      console.log("Задание успешно завершено")

      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
        taskStatus: "completed",
      })

      if (onTaskComplete) {
        onTaskComplete(task.id)
      }

      alert("Задание успешно выполнено!")
    } catch (error) {
      console.error("Ошибка при завершении верификации:", error)

      // Сбрасываем состояние верификации при ошибке
      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
        taskStatus: null,
      })

      alert(`Ошибка при завершении верификации: ${error.message}`)
    }
  }, [user.id, task.id, onTaskComplete, checkTaskStatus])

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
      console.log("Таймер завершен, начинаем верификацию")
      handleVerificationComplete()
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [verificationState.isVerifying, verificationState.timeLeft, handleVerificationComplete])

  // При монтировании компонента проверяем статус
  useEffect(() => {
    const checkInitialStatus = async () => {
      const status = await checkTaskStatus()
      if (status === "in_progress") {
        console.log("Обнаружено незавершенное задание")
        setVerificationState({
          isVerifying: true,
          timeLeft: 15000,
          taskStatus: status,
        })
      }
    }

    checkInitialStatus()
  }, [checkTaskStatus])

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

