"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { createMockTasks } from "../utils/mock-data"
import { TaskCard } from "../components/tasks/task-card"

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
  const [activeTab, setActiveTab] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])

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

  // Фильтруем задания при изменении активной вкладки или списка заданий
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([])
      return
    }

    // Фильтруем задания по категории
    const filtered = tasks.filter((task) => {
      // Используем поле category, если оно есть, иначе проверяем category_id
      const taskCategory = task.category?.name || getCategoryById(task.category_id)
      return taskCategory === activeTab
    })

    setFilteredTasks(filtered)
  }, [activeTab, tasks])

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

  // Функция для определения категории по ID
  const getCategoryById = (categoryId) => {
    if (!categoryId) return "daily"

    const categoryMap = {
      1: "daily",
      2: "partners",
      3: "social",
    }

    return categoryMap[categoryId] || "daily"
  }

  return (
    <div className="min-h-screen">
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">Задания</h1>
        <p className="text-gray-400 text-center text-sm">Выполняйте задания и получайте награды</p>
      </div>

      {/* Табы */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar bg-[#242838] rounded-lg p-1">
          {["daily", "partners", "social"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-1
                ${activeTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:text-gray-300"}
              `}
            >
              {tab === "daily" ? "Ежедневные" : tab === "partners" ? "Партнеры" : "Социальные"}
            </button>
          ))}
        </div>
      </div>

      {/* Список заданий */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (

      )}
    </div>
  )
}

