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
        <div className="animate-pulse flex items-center gap-2 text-primary/60">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-lg">Загрузка заданий...</span>
        </div>
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
    <div className="tasks-container max-w-3xl mx-auto p-4 animate-in fade-in-50 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Задания
        </h1>
        <p className="text-muted-foreground text-lg">Выполняйте задания и получайте награды</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 gap-4 p-1 mb-6 bg-card/50 backdrop-blur-sm rounded-lg">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all group"
          >
            <Target className="w-4 h-4 group-data-[state=active]:scale-110 transition-transform" />
            <span className="hidden sm:inline">Основные</span>
          </TabsTrigger>
          <TabsTrigger
            value="limited"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all group"
          >
            <Clock className="w-4 h-4 group-data-[state=active]:scale-110 transition-transform" />
            <span className="hidden sm:inline">Лимитированные</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievement"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all group"
          >
            <Trophy className="w-4 h-4 group-data-[state=active]:scale-110 transition-transform" />
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

