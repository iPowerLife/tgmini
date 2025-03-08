"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BottomMenu } from "../components/bottom-menu"

// Создаем компонент TasksSection внутри этого файла
function TasksSection({ user, tasks, onBalanceUpdate, onTaskComplete }) {
  const [activeTab, setActiveTab] = useState("daily")
  const [filteredTasks, setFilteredTasks] = useState([])

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
    <div className="min-h-[100vh] pb-[70px]">
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
      <div className="px-4 space-y-3 pb-24">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              onBalanceUpdate={onBalanceUpdate}
              onTaskComplete={onTaskComplete}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Нет доступных заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Компонент TaskCard
const TaskCard = ({ task, user, onBalanceUpdate, onTaskComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.is_completed || false)
  const [verificationTime, setVerificationTime] = useState(task.verification_time || 15)
  const [imageError, setImageError] = useState(false)

  const handleExecuteTask = async () => {
    if (isCompleted || isVerifying) return

    setIsVerifying(true)

    // Если есть ссылка, открываем ее
    if (task.link) {
      try {
        const tg = window.Telegram?.WebApp
        if (tg) {
          tg.openLink(task.link)
        } else {
          window.open(task.link, "_blank")
        }
      } catch (error) {
        console.error("Error opening link:", error)
      }
    }

    // Имитируем проверку выполнения задания
    const timer = setInterval(() => {
      setVerificationTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          completeTask()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const completeTask = async () => {
    setIsVerifying(false)
    setIsCompleted(true)

    try {
      // Здесь можно добавить логику для обновления в базе данных
      if (onTaskComplete) {
        onTaskComplete(task.id)
      }

      // Обновляем баланс пользователя
      if (user && onBalanceUpdate) {
        const newBalance = (user.balance || 0) + task.reward
        onBalanceUpdate(newBalance)
      }
    } catch (error) {
      console.error("Ошибка при выполнении задания:", error)
    }
  }

  // Функция для получения запасного изображения по категории
  const getFallbackImage = () => {
    const category = task.category?.name || getCategoryById(task.category_id)

    switch (category) {
      case "daily":
        return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
      case "partners":
        return "https://cdn-icons-png.flaticon.com/512/2991/2991112.png"
      case "social":
        return "https://cdn-icons-png.flaticon.com/512/2504/2504941.png"
      default:
        return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
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
    <div className="flex items-center bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg">
      {/* Изображение задания */}
      <div className="w-16 h-16 flex-shrink-0 p-2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#2A3142]">
          <img
            src={imageError ? getFallbackImage() : task.icon_url || getFallbackImage()}
            alt={task.title}
            className="w-10 h-10 object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      </div>

      {/* Содержимое задания */}
      <div className="flex-1 py-3 pr-2">
        <div className="text-white text-sm font-medium">{task.title}</div>
        {task.description && <div className="text-gray-400 text-xs mt-1">{task.description}</div>}
        <div className="flex items-center mt-1">
          <span className="text-blue-400 font-bold text-sm">+{task.reward}</span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pr-3">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        ) : isVerifying ? (
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <span className="text-xs text-gray-400">{verificationTime}с</span>
          </div>
        ) : (
          <button
            onClick={handleExecuteTask}
            className="px-5 py-2 rounded-full font-medium transition-all bg-blue-500 hover:bg-blue-400 text-white shadow-md"
          >
            Выполнить
          </button>
        )}
      </div>
    </div>
  )
}

export default function TasksPage({ user: initialUser, onBalanceUpdate, onTaskComplete }) {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(initialUser || null)

  useEffect(() => {
    async function fetchData() {
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

    fetchData()
  }, [user])

  // Функция для создания тестовых заданий
  const createMockTasks = () => {
    return [
      // Daily tasks
      {
        id: 1,
        title: "Ежедневный бонус",
        description: "Получите ежедневный бонус",
        reward: 50,
        is_active: true,
        category_id: 1,
        category: { name: "daily", display_name: "Ежедневные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
      },
      {
        id: 2,
        title: "Посмотреть видео",
        description: "Посмотрите короткое видео",
        reward: 30,
        is_active: true,
        category_id: 1,
        category: { name: "daily", display_name: "Ежедневные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
      },
      // Partners tasks
      {
        id: 3,
        title: "Установить приложение",
        description: "Установите партнерское приложение",
        reward: 100,
        is_active: true,
        category_id: 2,
        category: { name: "partners", display_name: "Партнеры" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
      },
      // Social tasks
      {
        id: 4,
        title: "Подписаться на Telegram",
        description: "Подпишитесь на наш Telegram канал",
        reward: 60,
        is_active: true,
        category_id: 3,
        category: { name: "social", display_name: "Социальные" },
        icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504941.png",
      },
    ]
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
      <TasksSection
        tasks={tasks}
        user={user}
        onTaskComplete={handleTaskComplete}
        onBalanceUpdate={handleBalanceUpdate}
      />
      <BottomMenu active="earn" />
    </div>
  )
}

