"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { initTelegram } from "../utils/telegram"
import { motion } from "framer-motion"
import { Clock, CheckCircle2, Trophy, ListTodo, Sparkles } from "lucide-react"

const pulseAnimation = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    },
  },
}

const formatTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return "Время истекло"

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
      ${active ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white" : "text-gray-400 hover:text-gray-300"}
    `}
  >
    <div className="flex items-center gap-1.5">
      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-gray-500"}`} />
      {children}
    </div>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
)

export function TasksSection({ user, onBalanceUpdate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [taskStates, setTaskStates] = useState({})

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasks(data?.tasks || [])
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Ошибка загрузки заданий: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadTasks()
    }
  }, [user?.id, loadTasks])

  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prevTasks) => {
        // Обновляем только если есть лимитированные задания
        const hasLimitedTasks = prevTasks.some((task) => task.type === "limited" && !task.is_completed)
        if (!hasLimitedTasks) return prevTasks

        // Возвращаем новый массив только если есть лимитированные задания
        return [...prevTasks]
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleExecuteTask = async (task) => {
    try {
      const { error: startError } = await supabase.rpc("start_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (startError) throw startError

      setTaskStates((prev) => ({
        ...prev,
        [task.id]: { status: "verifying", timeLeft: 15000 },
      }))

      if (task.link) {
        const tg = initTelegram()
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      }

      const interval = setInterval(() => {
        setTaskStates((prev) => {
          const taskState = prev[task.id]
          if (!taskState || taskState.timeLeft <= 0) {
            clearInterval(interval)
            return {
              ...prev,
              [task.id]: { status: "completed", timeLeft: 0 },
            }
          }

          const newTimeLeft = taskState.timeLeft - 1000
          return {
            ...prev,
            [task.id]: {
              status: newTimeLeft > 0 ? "verifying" : "completed",
              timeLeft: newTimeLeft,
            },
          }
        })
      }, 1000)
    } catch (error) {
      console.error("Ошибка при выполнении:", error)
      alert("Ошибка при выполнении задания: " + error.message)
    }
  }

  const handleClaimReward = async (task) => {
    try {
      const { error: completeError } = await supabase.rpc("complete_task", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (completeError) throw completeError

      const { data: rewardData, error: rewardError } = await supabase.rpc("claim_task_reward", {
        user_id_param: user.id,
        task_id_param: task.id,
      })

      if (rewardError) throw rewardError

      if (rewardData && onBalanceUpdate) {
        onBalanceUpdate(rewardData.new_balance)
      }

      await loadTasks()
    } catch (error) {
      console.error("Ошибка при получении награды:", error)
      alert("Ошибка при получении награды: " + error.message)
    }
  }

  const renderTaskButton = (task) => {
    const taskState = taskStates[task.id]

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

    if (taskState?.status === "completed") {
      return (
        <button
          onClick={() => handleClaimReward(task)}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600/80 rounded-lg border border-blue-500/50 hover:bg-blue-600/90 transition-colors text-white"
        >
          Получить
        </button>
      )
    }

    if (taskState?.status === "verifying") {
      return (
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-400"
          disabled
        >
          Проверка ({Math.ceil(taskState.timeLeft / 1000)}с)
        </button>
      )
    }

    if (task.type === "limited") {
      return (
        <button
          onClick={() => handleExecuteTask(task)}
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
        onClick={() => handleExecuteTask(task)}
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

  if (loading) {
    return <div className="tasks-loading">Загрузка заданий...</div>
  }

  if (error) {
    return <div className="tasks-error">{error}</div>
  }

  const filteredTasks = tasks
    .filter((task) => {
      if (activeTab === "all") return true
      return task.type === activeTab
    })
    .sort((a, b) => {
      // Сначала сортируем по статусу выполнения
      if (!a.is_completed && b.is_completed) return -1
      if (a.is_completed && !b.is_completed) return 1

      // Если оба задания не выполнены или оба выполнены,
      // сортируем limited задания наверх
      if (!a.is_completed && !b.is_completed) {
        if (a.type === "limited" && b.type !== "limited") return -1
        if (a.type !== "limited" && b.type === "limited") return 1
      }

      // В конце сортируем по времени создания
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const TaskCard = ({ task, children }) => (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        opacity: 0.9,
        transform: "scale(0.95)",
        marginBottom: "8px",
        padding: "12px",
        transition: "all 0.3s ease",
        border: "1px solid rgba(99, 102, 241, 0.1)",
        background: task.type === "limited" ? "linear-gradient(135deg, #392b4d 0%, #251b35 100%)" : "#1542cb",
        borderRadius: "12px",
        position: "relative",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      whileHover={{
        opacity: 1,
        transform: "scale(1)",
        background: task.type === "limited" ? "linear-gradient(135deg, #443357 0%, #2b1e3d 100%)" : "#1845d4",
        borderColor: task.type === "limited" ? "rgba(147, 51, 234, 0.25)" : "rgba(99, 102, 241, 0.2)",
        boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </motion.div>
  )

  return (
    <div className="min-h-[100vh] pb-[80px]">
      <div className="px-4">
        <div className="flex items-center justify-between p-2 mb-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
          <motion.div className="flex gap-1" initial={false}>
            <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} icon={ListTodo}>
              <span className="text-sm">Все</span>
            </TabButton>
            <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")} icon={CheckCircle2}>
              <span className="text-sm">Базовые</span>
            </TabButton>
            <TabButton active={activeTab === "limited"} onClick={() => setActiveTab("limited")} icon={Clock}>
              <span className="text-sm">Лимит</span>
            </TabButton>
            <TabButton active={activeTab === "achievement"} onClick={() => setActiveTab("achievement")} icon={Trophy}>
              <span className="text-sm">Достижения</span>
            </TabButton>
          </motion.div>
        </div>

        <div className="tasks-list space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task}>
              <div className="task-header">
                <div className="task-info">
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: task.type === "limited" && !task.is_completed ? "transparent" : "#e2e8f0",
                      backgroundImage:
                        task.type === "limited" && !task.is_completed
                          ? "linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)"
                          : "none",
                      backgroundClip: task.type === "limited" && !task.is_completed ? "text" : "border-box",
                      WebkitBackgroundClip: task.type === "limited" && !task.is_completed ? "text" : "border-box",
                    }}
                  >
                    {task.title}
                  </h3>
                </div>
              </div>
              {task.type === "limited" && !task.is_completed && (
                <motion.div
                  className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-[#1a1225]/80 border border-purple-500/20 shadow-inner shadow-purple-900/10"
                  variants={pulseAnimation}
                  initial="initial"
                  animate="animate"
                >
                  <span className="text-xs font-medium text-[#b4a2ff]">ОСТАЛОСЬ:</span>
                  <span className="text-sm font-mono font-medium text-[#d4c5ff]">
                    {task.end_date ? formatTimeRemaining(task.end_date) : "Время истекло"}
                  </span>
                </motion.div>
              )}
              {renderTaskButton(task)}
            </TaskCard>
          ))}

          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-tasks flex flex-col items-center justify-center p-6 text-gray-400"
            >
              <Sparkles className="w-8 h-8 mb-3 text-gray-500" />
              <p className="text-sm">В этой категории пока нет доступных заданий</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

