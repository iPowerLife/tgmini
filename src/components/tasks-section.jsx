"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"

export function TasksSection({ user, onBalanceUpdate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
          task_type_param: activeTab === "all" ? null : activeTab,
        })

        if (error) throw error

        setTasks(data.tasks || [])
      } catch (err) {
        console.error("Error loading tasks:", err)
        setError("Ошибка загрузки заданий")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadTasks()
    }
  }, [user?.id, activeTab])

  const handleStartTask = async (taskId) => {
    try {
      const { data, error } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      // Обновляем список заданий
      const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, user_status: "in_progress" } : task))
      setTasks(updatedTasks)
    } catch (err) {
      console.error("Error starting task:", err)
      alert("Ошибка при начале выполнения задания")
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      const { data, error } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      // Обновляем список заданий
      const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, user_status: "completed" } : task))
      setTasks(updatedTasks)
    } catch (err) {
      console.error("Error completing task:", err)
      alert("Ошибка при завершении задания")
    }
  }

  const handleClaimReward = async (taskId) => {
    try {
      const { data, error } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: taskId,
      })

      if (error) throw error

      // Обновляем баланс пользователя
      if (data.new_balance) {
        onBalanceUpdate(data.new_balance)
      }

      // Обновляем список заданий
      const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, reward_claimed: true } : task))
      setTasks(updatedTasks)
    } catch (err) {
      console.error("Error claiming reward:", err)
      alert("Ошибка при получении награды")
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="basic">Обычные</TabsTrigger>
          <TabsTrigger value="limited">Лимитированные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`} data-type={task.type}>
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400">Награда: </span>
                  <span className="font-medium text-white">{task.reward} 💎</span>
                </div>

                {!task.user_status && (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Начать
                  </button>
                )}

                {task.user_status === "in_progress" && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                  >
                    Завершить
                  </button>
                )}

                {task.user_status === "completed" && !task.reward_claimed && (
                  <button
                    onClick={() => handleClaimReward(task.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                  >
                    Получить награду
                  </button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="basic" className="space-y-4">
          {tasks
            .filter((task) => task.type === "basic")
            .map((task) => (
              <div key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`} data-type={task.type}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">Награда: </span>
                    <span className="font-medium text-white">{task.reward} 💎</span>
                  </div>

                  {!task.user_status && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Начать
                    </button>
                  )}

                  {task.user_status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Завершить
                    </button>
                  )}

                  {task.user_status === "completed" && !task.reward_claimed && (
                    <button
                      onClick={() => handleClaimReward(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Получить награду
                    </button>
                  )}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="limited" className="space-y-4">
          {tasks
            .filter((task) => task.type === "limited")
            .map((task) => (
              <div
                key={task.id}
                className={`task-card ${task.is_completed ? "completed" : ""} ${
                  task.type === "limited" && !task.is_completed
                    ? "bg-[#0f0a19] hover:bg-[#150d24] border-[#261b38]"
                    : "bg-gray-800/50 border-gray-700/50"
                }`}
              >
                {task.type === "limited" && !task.is_completed && (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-[#1a1332] border border-[#261b38]">
                    {task.time_status}
                  </div>
                )}
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">Награда: </span>
                    <span className="font-medium text-white">{task.reward} 💎</span>
                  </div>

                  {!task.user_status && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Начать
                    </button>
                  )}

                  {task.user_status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Завершить
                    </button>
                  )}

                  {task.user_status === "completed" && !task.reward_claimed && (
                    <button
                      onClick={() => handleClaimReward(task.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Получить награду
                    </button>
                  )}
                </div>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

