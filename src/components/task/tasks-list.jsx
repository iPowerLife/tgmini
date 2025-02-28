"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Trophy, LinkIcon } from "lucide-react"
import { supabase } from "../../supabase"

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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            {type === "limited"
              ? "Сейчас нет доступных лимитированных заданий"
              : type === "achievement"
                ? "Нет доступных достижений"
                : "Нет доступных заданий"}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{task.title}</span>
              <span className="text-xl">💎 {task.reward}</span>
            </CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {task.type === "limited" && task.end_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                <span>
                  Доступно до:{" "}
                  {new Date(task.end_date).toLocaleDateString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}

            {task.type === "achievement" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Прогресс</span>
                  <span className="text-muted-foreground">0/100</span>
                </div>
                <Progress value={0} />
              </div>
            )}

            {task.user_status === "active" && verificationTimers[task.id] > 0 && (
              <div className="mt-4">
                <Progress value={(verificationTimers[task.id] / 15) * 100} />
                <p className="text-center text-sm mt-2">Проверка: {verificationTimers[task.id]} сек</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span>Выполнили: {task.total_completions}</span>
            </div>
            <div className="flex gap-2">
              {!task.user_status && (
                <Button
                  variant="outline"
                  onClick={() => window.open(task.link, "_blank")}
                  disabled={processingTasks[task.id]}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Перейти
                </Button>
              )}
              {!task.user_status && (
                <Button onClick={() => startTask(task.id)} disabled={processingTasks[task.id]}>
                  Начать
                </Button>
              )}
              {task.user_status === "active" && verificationTimers[task.id] === 0 && (
                <Button onClick={() => completeTask(task.id)} disabled={processingTasks[task.id]}>
                  Завершить
                </Button>
              )}
              {task.user_status === "completed" && !task.reward_claimed && (
                <Button onClick={() => claimReward(task.id)} disabled={processingTasks[task.id]}>
                  Получить награду
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

