"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { TasksList } from "./tasks-list"
import { supabase } from "../supabase"
import { Trophy, Clock, Target, Sparkles } from "lucide-react"

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
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка заданий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tasks-container max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Задания
        </h1>
        <p className="text-muted-foreground text-center">Выполняйте задания и получайте награды</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 gap-4 p-1 mb-6 bg-card rounded-lg">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Основные</span>
          </TabsTrigger>
          <TabsTrigger
            value="limited"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Лимитированные</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievement"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Достижения</span>
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <TabsContent value="basic" className="space-y-4 focus:outline-none">
            <TasksList tasks={tasks.basic} type="basic" user={user} />
          </TabsContent>

          <TabsContent value="limited" className="space-y-4 focus:outline-none">
            <TasksList tasks={tasks.limited} type="limited" user={user} />
          </TabsContent>

          <TabsContent value="achievement" className="space-y-4 focus:outline-none">
            <TasksList tasks={tasks.achievement} type="achievement" user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

