"use client"

import { useState, useEffect } from "react"
import { PieChart, CheckCircle, Clock, Target, Award } from "lucide-react"
import { motion } from "framer-motion"

export function TaskStats({ tasks }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    expired: 0,
    totalRewards: 0,
    claimedRewards: 0,
    completionRate: 0,
  })

  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (!tasks || tasks.length === 0) return

    const completed = tasks.filter((task) => task.is_completed).length
    const inProgress = tasks.filter((task) => !task.is_completed && task.user_status === "in_progress").length
    const expired = tasks.filter((task) => task.is_expired).length

    const totalRewards = tasks.reduce((sum, task) => sum + (Number(task.reward) || 0), 0)
    const claimedRewards = tasks
      .filter((task) => task.is_completed && task.reward_claimed)
      .reduce((sum, task) => sum + (Number(task.reward) || 0), 0)

    setStats({
      total: tasks.length,
      completed,
      inProgress,
      expired,
      totalRewards,
      claimedRewards,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    })
  }, [tasks])

  if (!tasks || tasks.length === 0) return null

  return (
    <div className="mb-3">
      <button
        onClick={() => setShowStats(!showStats)}
        className="flex items-center justify-between w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 text-left"
      >
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Статистика заданий</span>
        </div>
        <div className="text-xs text-gray-400">{showStats ? "Скрыть" : "Показать"}</div>
      </button>

      {showStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-800/70 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-400">Выполнено</span>
              </div>
              <div className="text-sm font-medium">
                {stats.completed} из {stats.total}
              </div>
            </div>

            <div className="bg-gray-800/70 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-400">В процессе</span>
              </div>
              <div className="text-sm font-medium">{stats.inProgress}</div>
            </div>

            <div className="bg-gray-800/70 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-gray-400">Награды</span>
              </div>
              <div className="text-sm font-medium">
                {stats.claimedRewards} / {stats.totalRewards} 💎
              </div>
            </div>

            <div className="bg-gray-800/70 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs text-gray-400">Выполнение</span>
              </div>
              <div className="text-sm font-medium">{stats.completionRate}%</div>
            </div>
          </div>

          {/* Прогресс-бар выполнения */}
          <div className="mb-1 flex justify-between items-center text-xs">
            <span className="text-gray-400">Прогресс выполнения</span>
            <span className="text-gray-300">{stats.completionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

