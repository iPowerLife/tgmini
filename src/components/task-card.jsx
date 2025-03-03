"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, Button, Progress } from "antd"
import { initTelegram } from "../helpers/telegram"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

const TaskCard = ({ task, user, onTaskComplete }) => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    timeLeft: 0,
  })
  const supabase = useSupabaseClient()

  useEffect(() => {
    let intervalId

    if (verificationState.isVerifying) {
      // Проверяем, есть ли сохраненное время начала верификации в localStorage
      const storedStartTime = localStorage.getItem(`task_verification_${task.id}`)
      if (storedStartTime) {
        const startTime = Number.parseInt(storedStartTime, 10)
        const elapsedTime = Date.now() - startTime
        const timeLeft = Math.max(15000 - elapsedTime, 0)

        setVerificationState((prevState) => ({
          ...prevState,
          timeLeft: timeLeft,
        }))

        intervalId = setInterval(() => {
          setVerificationState((prevState) => {
            const newTimeLeft = Math.max(prevState.timeLeft - 1000, 0)
            return {
              ...prevState,
              timeLeft: newTimeLeft,
            }
          })
        }, 1000)
      } else {
        // Если время начала не сохранено, останавливаем верификацию
        setVerificationState({ isVerifying: false, timeLeft: 0 })
      }
    }

    return () => clearInterval(intervalId)
  }, [verificationState.isVerifying, task.id])

  useEffect(() => {
    if (verificationState.timeLeft <= 0 && verificationState.isVerifying) {
      setVerificationState({
        isVerifying: false,
        timeLeft: 0,
      })
    }
  }, [verificationState.timeLeft, verificationState.isVerifying])

  const handleExecuteTask = useCallback(async () => {
    try {
      if (task.is_expired) {
        alert("Время выполнения задания истекло")
        return
      }

      if (task.is_completed) {
        alert("Задание уже выполнено")
        return
      }

      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) {
        console.error("Ошибка при начале задания:", startError)
        alert("Ошибка при начале задания: " + startError.message)
        return
      }

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
      alert("Ошибка при выполнении задания: " + error.message)
    }
  }, [user.id, task.id, task.link, task.is_expired, task.is_completed])

  const handleVerificationComplete = useCallback(async () => {
    try {
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) {
        console.error("Ошибка при завершении задания:", completeError)
        alert("Ошибка при завершении задания: " + completeError.message)
        return
      }

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
      alert("Ошибка при завершении верификации: " + error.message)
    }
  }, [user.id, task.id, onTaskComplete])

  return (
    <Card
      title={task.title}
      extra={
        <>
          {verificationState.isVerifying && (
            <Progress type="circle" percent={(verificationState.timeLeft / 15000) * 100} width={50} />
          )}
          {!task.is_completed && !verificationState.isVerifying && (
            <Button type="primary" onClick={handleExecuteTask} disabled={task.is_expired}>
              Выполнить
            </Button>
          )}
          {verificationState.isVerifying && (
            <Button type="primary" onClick={handleVerificationComplete}>
              Подтвердить выполнение
            </Button>
          )}
        </>
      }
    >
      <p>{task.description}</p>
      <p>Reward: {task.reward}</p>
      {task.is_expired && <p>Expired</p>}
      {task.is_completed && <p>Completed</p>}
    </Card>
  )
}

export default TaskCard

