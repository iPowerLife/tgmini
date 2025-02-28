"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TasksList } from "./tasks-list"
import { supabase } from "../../supabase"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState({
    basic: [],
    limited: [],
    achievement: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
        })

        if (error) throw error

        // Группируем задания по типам
        const groupedTasks = {
          basic: [],
          limited: [],
          achievement: [],
        }

        data.tasks.forEach((task) => {
          groupedTasks[task.type].push(task)
        })

        setTasks(groupedTasks)
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
  }, [user?.id])

  if (loading) {
    return <div className="section-container">Загрузка заданий...</div>
  }

  if (error) {
    return <div className="section-container error">{error}</div>
  }

  return (
    <div className="tasks-container">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="limited">Лимитированные</TabsTrigger>
          <TabsTrigger value="achievement">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <TasksList tasks={tasks.basic} type="basic" user={user} />
        </TabsContent>

        <TabsContent value="limited">
          <TasksList tasks={tasks.limited} type="limited" user={user} />
        </TabsContent>

        <TabsContent value="achievement">
          <TasksList tasks={tasks.achievement} type="achievement" user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

