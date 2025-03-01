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
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="text-white/50 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          Загрузка заданий...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-white/50">{error}</p>
          <Button className="mt-4 bg-primary/80 hover:bg-primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.type === activeTab
  })

  return (
    <div className="tasks-container w-full max-w-2xl mx-auto px-4 py-6 sm:px-6">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="all" className="text-sm font-medium">
            Все
          </TabsTrigger>
          <TabsTrigger value="basic" className="text-sm font-medium">
            Базовые
          </TabsTrigger>
          <TabsTrigger value="achievement" className="text-sm font-medium">
            Достижения
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4 sm:gap-6 animate-fadeIn">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="task-card relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-800/50 hover:border-primary/20 transition-all duration-300"
              >
                {/* Декоративный элемент */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />

                <div className="relative space-y-4">
                  {/* Заголовок и награда */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 text-primary shrink-0">
                      <span className="text-lg sm:text-xl font-bold">{task.reward}</span>
                      <span className="text-base sm:text-lg">💎</span>
                    </div>
                  </div>

                  {/* Описание */}
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{task.description}</p>

                  {/* Кнопки */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {task.link && (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto sm:flex-1 bg-gray-900/50 hover:bg-gray-800 border-gray-700/50 hover:border-primary/30 text-gray-300"
                        onClick={() => window.open(task.link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Перейти к заданию
                      </Button>
                    )}
                    <Button className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                      <Play className="w-4 h-4 mr-2" />
                      Начать выполнение
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50 mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">В этой категории пока нет доступных заданий</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

