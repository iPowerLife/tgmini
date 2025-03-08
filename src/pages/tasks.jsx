"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { TasksSection } from "../components/tasks-section"
import { BottomMenu } from "../components/bottom-menu"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Получаем данные пользователя
        const { data: userData, error: userError } = await supabase.from("users").select("*").single()

        if (userError) {
          console.error("Ошибка при получении данных пользователя:", userError)
          setError("Ошибка при получении данных пользователя")
        } else {
          setUser(userData)
        }

        // Проверяем наличие категорий
        const { data: categoriesData, error: categoriesError } = await supabase.from("task_categories").select("*")

        if (categoriesError) {
          console.error("Ошибка при получении категорий:", categoriesError)
          setError("Ошибка при получении категорий")
        } else {
          console.log("Категории заданий:", categoriesData)

          if (!categoriesData || categoriesData.length === 0) {
            console.warn("Категории заданий не найдены. Создаем категории...")

            // Создаем категории, если их нет
            const { error: createCategoriesError } = await supabase
              .from("task_categories")
              .insert([{ name: "daily" }, { name: "partners" }, { name: "social" }])

            if (createCategoriesError) {
              console.error("Ошибка при создании категорий:", createCategoriesError)
              setError("Ошибка при создании категорий")
            }
          }
        }

        // Получаем все задания без фильтрации
        const { data: allTasksData, error: allTasksError } = await supabase
          .from("tasks")
          .select("*, task_categories(*)")

        if (allTasksError) {
          console.error("Ошибка при получении всех заданий:", allTasksError)
          setError("Ошибка при получении всех заданий")
        } else {
          console.log("Все задания из БД:", allTasksData)

          if (!allTasksData || allTasksData.length === 0) {
            console.warn("Задания не найдены. Создаем тестовые задания...")

            // Получаем ID категорий
            const { data: categoryIds } = await supabase.from("task_categories").select("id, name")

            if (categoryIds && categoryIds.length > 0) {
              const dailyId = categoryIds.find((c) => c.name === "daily")?.id
              const partnersId = categoryIds.find((c) => c.name === "partners")?.id
              const socialId = categoryIds.find((c) => c.name === "social")?.id

              // Создаем тестовые задания
              if (dailyId && partnersId && socialId) {
                const testTasks = [
                  // Daily tasks
                  {
                    title: "Ежедневный бонус",
                    description: "Получите ежедневный бонус",
                    reward: 50,
                    category_id: dailyId,
                    is_active: true,
                    type: "simple",
                  },
                  {
                    title: "Посмотреть видео",
                    description: "Посмотрите короткое видео и получите награду",
                    reward: 30,
                    category_id: dailyId,
                    link: "https://www.youtube.com/watch?v=example",
                    is_active: true,
                    type: "video",
                  },
                  // Partners tasks
                  {
                    title: "Подпишись на канал",
                    description: "Подпишитесь на наш Telegram канал",
                    reward: 50,
                    category_id: partnersId,
                    link: "https://t.me/example",
                    is_active: true,
                    type: "social",
                  },
                  // Social tasks
                  {
                    title: "Поделись постом",
                    description: "Поделитесь нашим постом в социальных сетях",
                    reward: 40,
                    category_id: socialId,
                    link: "https://twitter.com/example/status/123",
                    is_active: true,
                    type: "social",
                  },
                ]

                const { error: createTasksError } = await supabase.from("tasks").insert(testTasks)

                if (createTasksError) {
                  console.error("Ошибка при создании тестовых заданий:", createTasksError)
                  setError("Ошибка при создании тестовых заданий")
                } else {
                  console.log("Тестовые задания созданы успешно")
                }
              }
            }
          }
        }

        // Получаем задания еще раз после возможного создания
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*, task_categories(*)")

        if (tasksError) {
          console.error("Ошибка при получении заданий:", tasksError)
          setError("Ошибка при получении заданий")
        } else {
          console.log("Полученные задания:", tasksData)

          // Создаем тестовые задания для отображения, если их нет в БД
          if (!tasksData || tasksData.length === 0) {
            console.warn("Задания не найдены в БД. Создаем фиктивные задания для отображения...")

            const mockTasks = [
              {
                id: 1,
                title: "Ежедневный бонус",
                description: "Получите ежедневный бонус",
                reward: 50,
                category: "daily",
                task_categories: { name: "daily" },
                is_active: true,
                type: "simple",
              },
              {
                id: 2,
                title: "Посмотреть видео",
                description: "Посмотрите короткое видео",
                reward: 30,
                category: "daily",
                task_categories: { name: "daily" },
                is_active: true,
                type: "video",
              },
              {
                id: 3,
                title: "Подпишись на канал",
                description: "Подпишитесь на наш Telegram канал",
                reward: 50,
                category: "partners",
                task_categories: { name: "partners" },
                is_active: true,
                type: "social",
              },
              {
                id: 4,
                title: "Поделись постом",
                description: "Поделитесь нашим постом",
                reward: 40,
                category: "social",
                task_categories: { name: "social" },
                is_active: true,
                type: "social",
              },
            ]

            setTasks(mockTasks)
          } else {
            const processedTasks = tasksData.map((task) => ({
              ...task,
              category: task.task_categories?.name || "daily",
              is_completed: false,
              user_status: "new",
              reward_claimed: false,
              is_expired: false,
            }))

            console.log("Обработанные задания:", processedTasks)
            setTasks(processedTasks)
          }
        }
      } catch (error) {
        console.error("Непредвиденная ошибка:", error)
        setError("Непредвиденная ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      })
    }
  }

  const handleTaskComplete = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, is_completed: true, user_status: "completed" } : task)),
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1A1F2E] to-[#151A28]">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#1A1F2E] to-[#151A28] text-white p-4">
        <div className="text-red-500 text-xl mb-4">Ошибка загрузки данных</div>
        <div className="text-gray-400 mb-6">{error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2E] to-[#151A28] text-white">
      <header className="px-4 py-3 flex items-center justify-between bg-[#1A1F2E] border-b border-[#2A3142]/30">
        <div className="flex items-center">
          <button className="text-gray-400 hover:text-white transition-colors">Закрыть</button>
        </div>
      </header>

      <TasksSection
        user={user}
        tasks={tasks}
        onBalanceUpdate={handleBalanceUpdate}
        onTaskComplete={handleTaskComplete}
      />

      <BottomMenu active="earn" />
    </div>
  )
}

