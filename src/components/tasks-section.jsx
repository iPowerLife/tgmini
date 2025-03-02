"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { TaskItem } from "./task-item"
import { useTaskStore } from "@/store/taskStore"
import { Skeleton } from "@/components/ui/skeleton"

export const TasksSection = () => {
  const { address } = useAccount()
  const { tasks, fetchTasks } = useTaskStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getTasks = async () => {
      setLoading(true)
      if (address) {
        await fetchTasks(address)
      }
      setLoading(false)
    }

    getTasks()
  }, [address, fetchTasks])

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-5">Available Quests</h2>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 rounded-xl border border-gray-700/50 bg-gray-800/50 p-4"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.is_completed ? "completed" : ""} ${
                task.type === "limited" && !task.is_completed
                  ? "bg-[#0f0a19] hover:bg-[#150d24] border-[#261b38]"
                  : "bg-gray-800/50 border-gray-700/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-[#1a1332] border border-[#261b38]">
                {task.time_status}
              </div>
              <TaskItem task={task} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

