"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { TasksList } from "./tasks-list"
import { QuizTask } from "./quiz-task" // Возвращаем правильный путь импорта

export function TasksSection({ user }) {
  const [tasks, setTasks] = useState({
    basic: [],
    limited: [],
    achievement: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Загружаем задания всех типов
      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      // Группируем задания по типам
      const groupedTasks = data.tasks.reduce(
        (acc, task) => {
          if (!acc[task.type]) {
            acc[task.type] = []
          }
          acc[task.type].push(task)
          return acc
        },
        {
          basic: [],
          limited: [],
          achievement: [],
        },
      )

      setTasks(groupedTasks)
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Ошибка при загрузке заданий")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadTasks()
    }
  }, [user?.id, loadTasks])

  const handleTaskComplete = () => {
    // Перезагружаем задания после выполнения
    loadTasks()
  }

  if (loading) {
    return <div className="p-4 text-center">Загрузка заданий...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="tasks-container">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-center mb-6">
          <TabsTrigger value="basic">Базовые</TabsTrigger>
          <TabsTrigger value="limited">Лимитированные</TabsTrigger>
          <TabsTrigger value="achievement">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <TasksList tasks={tasks.basic} type="basic" user={user} onComplete={handleTaskComplete} />
        </TabsContent>

        <TabsContent value="limited">
          <TasksList tasks={tasks.limited} type="limited" user={user} onComplete={handleTaskComplete} />
        </TabsContent>

        <TabsContent value="achievement">
          {tasks.achievement.map((task) => (
            <QuizTask key={task.id} task={task} user={user} onComplete={handleTaskComplete} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

