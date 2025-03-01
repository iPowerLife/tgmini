"use client"

import { useState } from "react"
import { Timer } from "lucide-react"
import { motion } from "framer-motion"
import { fadeInUp, cardAnimation, buttonAnimation } from "../utils/animations"

// ... остальные импорты и код остаются теми же

export function TasksSection({ user, onBalanceUpdate }) {
  // ... существующий код состояний
  const [filteredTasks, setFilteredTasks] = useState([])

  const formatTimeRemaining = (endTime) => {
    const timeLeft = new Date(endTime).getTime() - new Date().getTime()
    if (timeLeft <= 0) {
      return "00:00"
    }

    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    const formattedMinutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(seconds).padStart(2, "0")

    return `${formattedMinutes}:${formattedSeconds}`
  }

  const handleExecuteTask = async (task) => {
    // Implement your task execution logic here
    console.log(`Executing task: ${task.title}`)
  }

  return (
    <motion.div className="tasks-page" initial="initial" animate="animate" variants={fadeInUp}>
      <div className="tasks-tabs">{/* ... существующие кнопки вкладок */}</div>

      <div className="tasks-list">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={`task-card ${task.is_completed ? "completed" : ""}`}
            variants={cardAnimation}
            initial="initial"
            animate="animate"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
          >
            <div className="task-header">
              <div className="task-info">
                <h3 className="task-title">{task.title}</h3>
                {task.type === "limited" && (
                  <div className="flex items-center justify-center mt-3 mb-4">
                    <motion.div
                      className="flex items-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-full px-3 py-1.5 border border-gray-700/30"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Timer className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
                      <span className="text-[10px] font-medium tracking-[0.15em] text-gray-400 mr-1">ОСТАЛОСЬ:</span>
                      <span className="text-xs font-semibold text-blue-400">
                        {task.end_date ? formatTimeRemaining(task.end_date) : "10:00"}
                      </span>
                    </motion.div>
                  </div>
                )}
                <p className="task-description">{task.description}</p>
              </div>
            </div>
            <div className="task-actions">
              <motion.button
                variants={buttonAnimation}
                whileTap="tap"
                whileHover="hover"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium"
                onClick={() => handleExecuteTask(task)}
              >
                Выполнить
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <motion.div className="no-tasks" variants={fadeInUp} initial="initial" animate="animate">
            В этой категории пока нет доступных заданий
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

