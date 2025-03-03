"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Skeleton } from "./skeleton"

function TaskSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function TasksSection({ user, onBalanceUpdate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
        })

        setTasks(data?.tasks || [])
      } catch (err) {
        console.error("Error loading tasks:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user?.id])

  const filteredTasks = tasks
    .filter((task) => {
      if (activeTab === "all") return true
      return task.type === activeTab
    })
    .sort((a, b) => {
      if (!a.is_completed && b.is_completed) return -1
      if (a.is_completed && !b.is_completed) return 1
      if (!a.is_expired && b.is_expired) return -1
      if (a.is_expired && !b.is_expired) return 1
      if (a.type === "limited" && b.type !== "limited") return -1
      if (a.type !== "limited" && b.type === "limited") return 1
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <div className="min-h-[100vh] pb-[70px]">
      <div className="px-3">
        <div className="flex items-center justify-between p-1.5 mb-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
          <div className="flex gap-0.5">
            {loading ? (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`tab-button ${activeTab === "all" ? "active" : ""}`}
                >
                  Все
                </button>
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
                >
                  Базовые
                </button>
                <button
                  onClick={() => setActiveTab("limited")}
                  className={`tab-button ${activeTab === "limited" ? "active" : ""}`}
                >
                  Лимит
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {loading ? (
            <>
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <div className="task-reward">💎 {task.reward}</div>
                </div>
                <p>{task.description}</p>
                <button className={`task-button ${task.is_completed ? "completed" : ""}`} disabled={task.is_completed}>
                  {task.is_completed ? "Выполнено" : "Выполнить"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

