"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { motion } from "framer-motion"
import { Clock, CheckCircle2, Trophy, ListTodo, Sparkles } from "lucide-react"
import { TaskCard } from "./task-card"

const TabButton = ({ active, onClick, children, icon: Icon, disabled }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
      ${active ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white" : "text-gray-400 hover:text-gray-300"}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
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

  // Загрузка заданий
  const loadTasks = useCallback(async () => {
    if (!user?.id) return

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

  // Загрузка заданий при монтировании компонента
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Обработчик завершения задания
  const handleTaskComplete = useCallback(
    (taskId) => {
      loadTasks()
    },
    [loadTasks],
  )

  if (loading && !tasks.length) {
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

      // Затем по истечению срока
      if (!a.is_expired && b.is_expired) return -1
      if (a.is_expired && !b.is_expired) return 1

      // Затем по типу (лимитированные первыми)
      if (a.type === "limited" && b.type !== "limited") return -1
      if (a.type !== "limited" && b.type === "limited") return 1

      // И наконец по времени создания
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <div className="min-h-[100vh] pb-[70px]">
      <div className="px-3">
        <div className="flex items-center justify-between p-1.5 mb-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
          <motion.div className="flex gap-0.5" initial={false}>
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon={ListTodo}
              disabled={loading}
            >
              <span className="text-xs">Все</span>
            </TabButton>
            <TabButton
              active={activeTab === "basic"}
              onClick={() => setActiveTab("basic")}
              icon={CheckCircle2}
              disabled={loading}
            >
              <span className="text-xs">Базовые</span>
            </TabButton>
            <TabButton
              active={activeTab === "limited"}
              onClick={() => setActiveTab("limited")}
              icon={Clock}
              disabled={loading}
            >
              <span className="text-xs">Лимит</span>
            </TabButton>
            <TabButton
              active={activeTab === "achievement"}
              onClick={() => setActiveTab("achievement")}
              icon={Trophy}
              disabled={loading}
            >
              <span className="text-xs">Достижения</span>
            </TabButton>
          </motion.div>
        </div>

        <div className="flex flex-col gap-1">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              onBalanceUpdate={onBalanceUpdate}
              onTaskComplete={handleTaskComplete}
            />
          ))}

          {!loading && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-4 text-gray-400">
              <Sparkles className="w-6 h-6 mb-2 text-gray-500" />
              <p className="text-xs">В этой категории пока нет доступных заданий</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

