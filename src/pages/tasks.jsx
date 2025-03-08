"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BottomMenu } from "../components/bottom-menu"
import { TasksContainer } from "../components/tasks/tasks-container"
import { createMockTasks } from "../utils/mock-data"

export default function TasksPage({
  user: initialUser,
  onBalanceUpdate,
  onTaskComplete,
  tasks: initialTasks,
  isLoading,
}) {
  const [loading, setLoading] = useState(isLoading !== undefined ? isLoading : true)
  const [tasks, setTasks] = useState(initialTasks || [])
  const [user, setUser] = useState(initialUser || null)

  // Если задания уже переданы через пропсы, используем их
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks)
      setLoading(false)
    } else if (!isLoading && !initialTasks) {
      // Если задания не переданы и не загружаются, загружаем их сами
      fetchTasks()
    }
  }, [initialTasks, isLoading])

  // Функция для загрузки заданий, если они не были переданы через пропсы
  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Получаем задания
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(`
          *,
          category:task_categories(name, display_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (tasksError) throw tasksError

      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData)
      } else {
        // Если заданий нет, создаем тестовые
        setTasks(createMockTasks())
      }

      // Получаем данные пользователя, если они не были переданы
      if (!user) {
        const { data: userData } = await supabase.from("users").select("*").single()

        if (userData) setUser(userData)
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      // Создаем тестовые данные при ошибке
      setTasks(createMockTasks())
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = (taskId) => {
    // Обновляем локальное состояние
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true } : task)))

    // Вызываем переданный обработчик, если он есть
    if (onTaskComplete) {
      onTaskComplete(taskId)
    }
  }

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      })
    }

    // Вызываем переданный обработчик, если он есть
    if (onBalanceUpdate) {
      onBalanceUpdate(newBalance)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1F2E]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <TasksContainer
        tasks={tasks}
        user={user}
        onTaskComplete={handleTaskComplete}
        onBalanceUpdate={handleBalanceUpdate}
      />
      <BottomMenu active="earn" />
    </div>
  )
}

