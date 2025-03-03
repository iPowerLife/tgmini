"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Clock, Trophy, CheckCircle, Gift, Users, ExternalLink, Play } from "lucide-react"
import { supabase } from "../supabase"

const formatTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return "Время истекло"

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TasksList({ tasks, type, user }) {
  const [processingTasks, setProcessingTasks] = useState({})
  const [verificationTimers, setVerificationTimers] = useState({})

  const startTask = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      // Запускаем таймер верификации
      const timer = setInterval(() => {
        setVerificationTimers((prev) => {
          const timeLeft = (prev[taskId] || 15) - 1
          if (timeLeft <= 0) {
            clearInterval(timer)
            return { ...prev, [taskId]: 0 }
          }
          return { ...prev, [taskId]: timeLeft }
        })
      }, 1000)

      setVerificationTimers((prev) => ({ ...prev, [taskId]: 15 }))
    } catch (error) {
      console.error("Error starting task:", error)
      alert("Ошибка при начале выполнения задания")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  const completeTask = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      if (data.success) {
        alert("Задание успешно выполнено! Теперь вы можете получить награду.")
      } else if (data.remaining_seconds) {
        alert(`Подождите еще ${data.remaining_seconds} секунд`)
      }
    } catch (error) {
      console.error("Error completing task:", error)
      alert("Ошибка при выполнении задания")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  const claimReward = async (taskId) => {
    try {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: true }))

      const { data, error } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      if (data.success) {
        alert(`Награда получена: ${data.reward} 💎`)
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
      alert("Ошибка при получении награды")
    } finally {
      setProcessingTasks((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  if (!tasks.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              {type === "limited" ? (
                <Clock className="w-12 h-12 text-muted-foreground/50" />
              ) : type === "achievement" ? (
                <Trophy className="w-12 h-12 text-muted-foreground/50" />
              ) : (
                <CheckCircle className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            <p className="text-lg font-medium mb-2">
              {type === "limited"
                ? "Сейчас нет доступных лимитированных заданий"
                : type === "achievement"
                  ? "Нет доступных достижений"
                  : "Нет доступных заданий"}
            </p>
            <p className="text-sm">Загляните позже, чтобы увидеть новые задания</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="group bg-[#1a1b1e]/80 hover:bg-[#1a1b1e] border-[#2c2e33] hover:border-primary/30 transition-all duration-300"
        >
          <CardHeader className="relative pb-2">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg font-medium text-white/90 mb-1">{task.title}</CardTitle>
                <CardDescription className="text-sm text-white/70">{task.description}</CardDescription>
                {task.type === "limited" && task.end_date && (
                  <div className="flex items-center gap-2 mt-2 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Осталось: {formatTimeRemaining(task.end_date)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="text-lg font-medium">{task.reward}</span>
                <span className="text-sm">💎</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Выполнили: {task.total_completions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Получили награду: {task.total_rewards_claimed}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 pt-0">
            {!task.user_status && task.link && (
              <Button
                variant="outline"
                onClick={() => window.open(task.link, "_blank")}
                disabled={processingTasks[task.id]}
                className="flex-1 h-9 bg-[#2c2e33] hover:bg-[#3c3e43] border-[#3c3e43] hover:border-primary/30 text-white/90"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Перейти
              </Button>
            )}
            {!task.user_status && (
              <Button
                onClick={() => startTask(task.id)}
                disabled={processingTasks[task.id]}
                className="flex-1 h-9 bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80"
              >
                <Play className="w-4 h-4 mr-2" />
                Начать
              </Button>
            )}
            {task.user_status === "active" && verificationTimers[task.id] === 0 && (
              <Button
                onClick={() => completeTask(task.id)}
                disabled={processingTasks[task.id]}
                className="w-full sm:w-auto"
              >
                Завершить
              </Button>
            )}
            {task.user_status === "completed" && !task.reward_claimed && (
              <Button
                onClick={() => claimReward(task.id)}
                disabled={processingTasks[task.id]}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <Gift className="w-4 h-4 mr-2" />
                Получить награду
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

