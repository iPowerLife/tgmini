"use client"

import { useState, useEffect } from "react"

// Типы рейтингов
const RATING_TYPES = {
  MINING: "mining",
  REFERRALS: "referrals",
  LEVEL: "level",
  TASKS: "tasks",
}

// Названия рейтингов
const RATING_LABELS = {
  [RATING_TYPES.MINING]: "Майнинг",
  [RATING_TYPES.REFERRALS]: "Рефералы",
  [RATING_TYPES.LEVEL]: "Уровень",
  [RATING_TYPES.TASKS]: "Задания",
}

// Иконки для рейтингов
const RATING_ICONS = {
  [RATING_TYPES.MINING]: "⛏️",
  [RATING_TYPES.REFERRALS]: "👥",
  [RATING_TYPES.LEVEL]: "🏆",
  [RATING_TYPES.TASKS]: "✅",
}

// Цвета для топ-3 позиций
const POSITION_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"]

// Количество элементов на странице
const ITEMS_PER_PAGE = 20

const RatingSection = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // Состояния
  const [activeRatingType, setActiveRatingType] = useState(RATING_TYPES.MINING)
  const [currentPage, setCurrentPage] = useState(0)
  const [ratingData, setRatingData] = useState([])
  const [telegramUser, setTelegramUser] = useState(null)

  useEffect(() => {
    // Простая проверка, что компонент монтируется
    console.log("RatingSection mounted")

    // Проверяем доступность Telegram API
    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp is available")
    } else {
      console.log("Telegram WebApp is not available")
    }

    return () => {
      console.log("RatingSection unmounted")
    }
  }, [])

  // Получаем данные пользователя из Telegram
  useEffect(() => {
    const telegram = window.Telegram?.WebApp
    if (telegram) {
      setTelegramUser(telegram.initDataUnsafe?.user || null)
    }
  }, [])

  // Функция для получения данных рейтинга из Supabase
  // const fetchRatingData = useCallback(async (type) => {
  //   try {
  //     setIsLoading(true)
  //     setError(null)

  //     let query

  //     switch (type) {
  //       case RATING_TYPES.MINING:
  //         query = supabase
  //           .from("users")
  //           .select("id, telegram_id, username, first_name, last_name, photo_url, mining_power, level")
  //           .order("mining_power", { ascending: false })
  //           .limit(100)
  //         break

  //       case RATING_TYPES.REFERRALS:
  //         query = supabase
  //           .from("users")
  //           .select("id, telegram_id, username, first_name, last_name, photo_url, referral_count, level")
  //           .order("referral_count", { ascending: false })
  //           .limit(100)
  //         break

  //       case RATING_TYPES.LEVEL:
  //         query = supabase
  //           .from("users")
  //           .select("id, telegram_id, username, first_name, last_name, photo_url, level, experience")
  //           .order("level", { ascending: false })
  //           .order("experience", { ascending: false })
  //           .limit(100)
  //         break

  //       case RATING_TYPES.TASKS:
  //         query = supabase
  //           .from("user_tasks")
  //           .select("user_id, users:user_id(id, telegram_id, username, first_name, last_name, photo_url, level)")
  //           .eq("status", "completed")
  //           .limit(500)
  //         break

  //       default:
  //         query = supabase
  //           .from("users")
  //           .select("id, telegram_id, username, first_name, last_name, photo_url, mining_power, level")
  //           .order("mining_power", { ascending: false })
  //           .limit(100)
  //       }

  //     const { data, error: queryError } = await query

  //     if (queryError) throw queryError

  //     if (type === RATING_TYPES.TASKS) {
  //       const userTasksCount = data.reduce((acc, item) => {
  //         const userId = item.user_id
  //         if (!acc[userId]) {
  //           acc[userId] = {
  //             ...item.users,
  //             tasks_completed: 1,
  //           }
  //         } else {
  //           acc[userId].tasks_completed += 1
  //         }
  //         return acc
  //       }, {})

  //       const processedData = Object.values(userTasksCount).sort((a, b) => b.tasks_completed - a.tasks_completed)
  //       setRatingData(processedData)
  //     } else {
  //       setRatingData(data)
  //     }
  //   } catch (err) {
  //     setError(err.message)
  //     console.error("Error fetching rating data:", err)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [])

  // Загружаем данные при изменении типа рейтинга
  // useEffect(() => {
  //   fetchRatingData(activeRatingType)
  // }, [activeRatingType, fetchRatingData])

  // Получаем позицию текущего пользователя
  // const currentUserPosition = useMemo(() => {
  //   if (!ratingData?.length || !telegramUser) return null

  //   const index = ratingData.findIndex((item) => item.telegram_id === telegramUser.id || item.id === telegramUser.id)

  //   return index !== -1 ? { ...ratingData[index], position: index + 1 } : null
  // }, [ratingData, telegramUser])

  // Функция для отображения значения в зависимости от типа рейтинга
  // const getRatingValue = useCallback(
  //   (item) => {
  //     switch (activeRatingType) {
  //       case RATING_TYPES.MINING:
  //         return `${item.mining_power || 0} ⚡`
  //       case RATING_TYPES.REFERRALS:
  //         return `${item.referral_count || 0} 👥`
  //       case RATING_TYPES.LEVEL:
  //         return `Ур. ${item.level || 1}`
  //       case RATING_TYPES.TASKS:
  //         return `${item.tasks_completed || 0} ✅`
  //       default:
  //         return `${item.mining_power || 0} ⚡`
  //     }
  //   },
  //   [activeRatingType],
  // )

  // Функция для отображения имени пользователя
  // const getUserName = useCallback((item) => {
  //   if (item.username) return `@${item.username}`
  //   if (item.first_name) {
  //     return item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name
  //   }
  //   return `User ${item.telegram_id}`
  // }, [])

  // Получаем данные для текущей страницы
  // const currentPageData = useMemo(() => {
  //   if (!ratingData?.length) return []
  //   const startIndex = currentPage * ITEMS_PER_PAGE
  //   return ratingData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  // }, [ratingData, currentPage])

  // Общее количество страниц
  // const totalPages = useMemo(() => {
  //   if (!ratingData?.length) return 0
  //   return Math.ceil(ratingData.length / ITEMS_PER_PAGE)
  // }, [ratingData])

  // Обработчики пагинации
  // const goToNextPage = useCallback(() => {
  //   if (currentPage < totalPages - 1) {
  //     setCurrentPage((prev) => prev + 1)
  //   }
  // }, [currentPage, totalPages])

  // const goToPrevPage = useCallback(() => {
  //   if (currentPage > 0) {
  //     setCurrentPage((prev) => prev - 1)
  //   }
  // }, [currentPage])

  // Обработчик изменения типа рейтинга
  // const handleRatingTypeChange = useCallback((type) => {
  //   setActiveRatingType(type)
  //   setCurrentPage(0)
  // }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="rating-section">
      <h1>Рейтинг</h1>
      <p>Тестовая версия компонента</p>
    </div>
  )
}

export default RatingSection

