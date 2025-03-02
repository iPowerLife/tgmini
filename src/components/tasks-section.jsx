"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle2, Trophy, ListTodo, Sparkles } from "lucide-react"
import { TaskCard } from "./task-card"

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

const VerificationTimer = ({ timeLeft, onComplete }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer)
        onComplete()
        return
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  return <div className="text-center text-gray-400">Проверка ({Math.ceil(timeLeft / 1000)}с)</div>
}

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

  const handleTaskComplete = useCallback(
    (taskId) => {
      loadTasks()
    },
    [loadTasks],
  )

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
          <AnimatePresence
            mode="popLayout"
            initial={false} // Отключаем начальную анимацию при первом рендере
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05, // Добавляем задержку между анимациями карточек
                  },
                },
              }}
            >
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={user}
                  onBalanceUpdate={onBalanceUpdate}
                  onTaskComplete={handleTaskComplete}
                />
              ))}
            </motion.div>
          </AnimatePresence>

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

