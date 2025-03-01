"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Play } from "lucide-react"
import { supabase } from "../supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Button } from "./ui/button"

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_available_tasks", {
          user_id_param: user.id,
        })

        if (error) throw error

        setTasks(data.tasks)
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
        <div className="text-white/50">Загрузка заданий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-white/50">{error}</p>
        </div>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.type === activeTab
  })

  return (
    <div className="tasks-container max-w-2xl mx-auto p-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all" className="text-sm font-medium">
            Все задания
          </TabsTrigger>
          <TabsTrigger value="basic" className="text-sm font-medium">
            Базовые
          </TabsTrigger>
          <TabsTrigger value="achievement" className="text-sm font-medium">
            Достижения
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="task-card bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-800/50 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {task.title}
                    </h3>
                    <p className="mt-2 text-gray-400 leading-relaxed">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary ml-4">
                    <span className="text-xl font-bold">{task.reward}</span>
                    <span className="text-lg">💎</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {task.link && (
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none min-w-[140px] bg-gray-900/50 hover:bg-gray-800"
                      onClick={() => window.open(task.link, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Перейти
                    </Button>
                  )}
                  <Button className="flex-1 sm:flex-none min-w-[140px] bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80">
                    <Play className="w-4 h-4 mr-2" />
                    Начать
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Нет доступных заданий в этой категории</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

