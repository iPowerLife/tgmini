"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
<<<<<<< HEAD
import { Clock, Trophy, LinkIcon, Timer, Gift, Users, CheckCircle2, ArrowRight } from "lucide-react"
=======
import { Clock, Trophy, LinkIcon, CheckCircle, Timer, Gift } from "lucide-react"
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
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
<<<<<<< HEAD
      <Card className="border-dashed bg-card/50 backdrop-blur-sm">
=======
      <Card className="border-dashed">
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              {type === "limited" ? (
<<<<<<< HEAD
                <Clock className="h-12 w-12 text-muted-foreground/50" />
              ) : type === "achievement" ? (
                <Trophy className="h-12 w-12 text-muted-foreground/50" />
              ) : (
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />
=======
                <Clock className="w-12 h-12 text-muted-foreground/50" />
              ) : type === "achievement" ? (
                <Trophy className="w-12 h-12 text-muted-foreground/50" />
              ) : (
                <CheckCircle className="w-12 h-12 text-muted-foreground/50" />
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
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
    <div className="grid gap-4 animate-in fade-in-50 duration-500">
      {tasks.map((task) => (
<<<<<<< HEAD
        <Card
          key={task.id}
          className="group hover:shadow-lg transition-all duration-300 hover:shadow-primary/5 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20"
        >
          <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">{task.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <Gift className="w-5 h-5" />
                  <span className="text-lg font-semibold tabular-nums">{task.reward} 💎</span>
                </div>
=======
        <Card key={task.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                <CardDescription className="text-base">{task.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">{task.reward} 💎</span>
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {task.type === "limited" && task.end_date && (
<<<<<<< HEAD
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border border-primary/5">
=======
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-muted/50 p-2 rounded-lg">
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
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
<<<<<<< HEAD
              <div className="p-3 rounded-lg bg-muted/50 border border-primary/5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Прогресс выполнения</span>
                  <span className="text-muted-foreground tabular-nums">0/100</span>
                </div>
                <Progress value={0} className="h-2 bg-primary/10" />
=======
              <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Прогресс выполнения</span>
                  <span className="text-muted-foreground">0/100</span>
                </div>
                <Progress value={0} className="h-2" />
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
              </div>
            )}

            {task.user_status === "active" && verificationTimers[task.id] > 0 && (
<<<<<<< HEAD
              <div className="p-3 rounded-lg bg-muted/50 border border-primary/5">
                <Progress value={(verificationTimers[task.id] / 15) * 100} className="h-2 bg-primary/10" />
                <p className="text-center text-sm mt-2 font-medium tabular-nums">
                  Проверка: {verificationTimers[task.id]} сек
                </p>
              </div>
            )}
          </CardContent>

=======
              <div className="mt-4 bg-muted/50 p-3 rounded-lg">
                <Progress value={(verificationTimers[task.id] / 15) * 100} className="h-2" />
                <p className="text-center text-sm mt-2 font-medium">Проверка: {verificationTimers[task.id]} сек</p>
              </div>
            )}
          </CardContent>
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="tabular-nums">Выполнили: {task.total_completions}</span>
            </div>
<<<<<<< HEAD

            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              {!task.user_status && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(task.link, "_blank")}
                    disabled={processingTasks[task.id]}
                    className="w-full sm:w-auto group/button"
                  >
                    <LinkIcon className="w-4 h-4 mr-2 group-hover/button:-translate-y-0.5 transition-transform" />
                    Перейти
                  </Button>
                  <Button
                    onClick={() => startTask(task.id)}
                    disabled={processingTasks[task.id]}
                    className="w-full sm:w-auto group/button"
                  >
                    Начать
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/button:translate-x-0.5 transition-transform" />
                  </Button>
                </>
=======
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              {!task.user_status && (
                <Button
                  variant="outline"
                  onClick={() => window.open(task.link, "_blank")}
                  disabled={processingTasks[task.id]}
                  className="w-full sm:w-auto"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Перейти
                </Button>
              )}
              {!task.user_status && (
                <Button
                  onClick={() => startTask(task.id)}
                  disabled={processingTasks[task.id]}
                  className="w-full sm:w-auto"
                >
                  Начать
                </Button>
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
              )}

              {task.user_status === "active" && verificationTimers[task.id] === 0 && (
                <Button
                  onClick={() => completeTask(task.id)}
                  disabled={processingTasks[task.id]}
                  className="w-full sm:w-auto"
                >
<<<<<<< HEAD
                  <CheckCircle2 className="w-4 h-4 mr-2" />
=======
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
                  Завершить
                </Button>
              )}

              {task.user_status === "completed" && !task.reward_claimed && (
                <Button
                  onClick={() => claimReward(task.id)}
                  disabled={processingTasks[task.id]}
<<<<<<< HEAD
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 group/button"
                >
                  <Gift className="w-4 h-4 mr-2 group-hover/button:scale-110 transition-transform" />
=======
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  <Gift className="w-4 h-4 mr-2" />
>>>>>>> 65b1e3865b8dc17313f9829b9cc86554f146bc42
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

