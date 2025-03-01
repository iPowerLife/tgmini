"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Play, Clock } from "lucide-react"
import { supabase } from "../supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"

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
          <button
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    return task.type === activeTab
  })

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="basic">Базовые</TabsTrigger>
          <TabsTrigger value="limited">
            <Clock className="w-4 h-4 mr-1" />
            Лимит
          </TabsTrigger>
          <TabsTrigger value="achievement">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-800/50"
              >
                <div className="space-y-4">
                  {/* Заголовок и награда */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
                      <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400 shrink-0">
                      <span className="text-lg font-bold">{task.reward}</span>
                      <span>💎</span>
                    </div>
                  </div>

                  {/* Кнопки */}
                  <div className="flex gap-2">
                    {task.link && (
                      <button
                        onClick={() => window.open(task.link, "_blank")}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Перейти
                      </button>
                    )}
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      <Play className="w-4 h-4" />
                      Начать
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">В этой категории пока нет доступных заданий</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

