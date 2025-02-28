"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Clock, Trophy, CheckCircle, Timer, Gift, Users, ExternalLink, Play } from "lucide-react"
import { supabase } from "../supabase"

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
          className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden"
        >
          <CardHeader className="relative pb-0">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">{task.reward} 💎</span>
              </div>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${
                  type === "limited"
                    ? "bg-orange-500/10 text-orange-500"
                    : type === "achievement"
                      ? "bg-purple-500/10 text-purple-500"
                      : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {type === "limited" ? (
                  <Clock className="w-6 h-6" />
                ) : type === "achievement" ? (
                  <Trophy className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2 pr-32">{task.title}</CardTitle>
                <CardDescription className="text-base">{task.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {task.type === "limited" && task.end_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-muted/50 p-3 rounded-xl">
                <Timer className="w-4 h-4 text-primary" />
                <span>
                  Доступно до:{" "}
                  {new Date(task.end_date).toLocaleDateString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {task.type === "achievement" && (
              <div className="space-y-2 bg-muted/50 p-3 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Прогресс выполнения</span>
                  <span className="text-muted-foreground">0/100</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            )}

            {task.user_status === "active" && verificationTimers[task.id] > 0 && (
              <div className="mt-4 bg-muted/50 p-3 rounded-xl">
                <Progress value={(verificationTimers[task.id] / 15) * 100} className="h-2" />
                <p className="text-center text-sm mt-2 font-medium">Проверка: {verificationTimers[task.id]} сек</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Users className="w-4 h-4" />
              <span>Выполнили: {task.total_completions}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 pt-0">
            {!task.user_status && task.link && (
              <Button
                variant="outline"
                onClick={() => window.open(task.link, "_blank")}
                disabled={processingTasks[task.id]}
                className="min-w-[120px] h-[40px]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Перейти
              </Button>
            )}
            {!task.user_status && (
              <Button
                onClick={() => startTask(task.id)}
                disabled={processingTasks[task.id]}
                className="min-w-[120px] h-[40px]"
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

