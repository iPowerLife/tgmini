"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "./ui/tabs"
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
        <div className="animate-pulse flex items-center gap-2 text-indigo-500/60">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-lg">Загрузка заданий...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in-50 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Задания
        </h1>
        <p className="text-gray-400 text-lg">Выполняйте задания и получайте награды</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-800 backdrop-blur-sm p-6">
        <div className="grid grid-cols-3 gap-4 p-1 mb-6 bg-gray-900/50 rounded-lg border border-gray-800">
          <button
            onClick={() => document.querySelector('[value="basic"]').click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-indigo-500/10 focus:outline-none group"
          >
            <Target className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-white">Основные</span>
          </button>
          <button
            onClick={() => document.querySelector('[value="limited"]').click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-indigo-500/10 focus:outline-none group"
          >
            <Clock className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-white">Лимитированные</span>
          </button>
          <button
            onClick={() => document.querySelector('[value="achievement"]').click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-indigo-500/10 focus:outline-none group"
          >
            <Trophy className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-white">Достижения</span>
          </button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsContent value="basic" className="focus:outline-none">
            <TasksList tasks={tasks.basic} type="basic" user={user} />
          </TabsContent>

          <TabsContent value="limited" className="focus:outline-none">
            <TasksList tasks={tasks.limited} type="limited" user={user} />
          </TabsContent>

          <TabsContent value="achievement" className="focus:outline-none">
            <TasksList tasks={tasks.achievement} type="achievement" user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

