"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { useTelegramUser } from "../hooks/use-telegram-user"
import { useCachedData } from "../hooks/use-cached-data"
import { OptimizedImage } from "./optimized-image"

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
  // Состояния
  const [activeRatingType, setActiveRatingType] = useState(RATING_TYPES.MINING)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMyPosition, setShowMyPosition] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Получаем данные пользователя из Telegram
  const { user: telegramUser } = useTelegramUser()

  // Используем хук для кэширования данных рейтинга
  const {
    data: ratingData,
    isLoading: isDataLoading,
    error: dataError,
    mutate,
  } = useCachedData(`ratings_${activeRatingType}`, () => fetchRatingData(activeRatingType), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // Обновляем данные каждую минуту
  })

  // Получаем позицию текущего пользователя
  const currentUserPosition = useMemo(() => {
    if (!ratingData || !telegramUser) return null

    const index = ratingData.findIndex((item) => item.telegram_id === telegramUser.id || item.id === telegramUser.id)

    return index !== -1 ? { ...ratingData[index], position: index + 1 } : null
  }, [ratingData, telegramUser])

  // Функция для получения данных рейтинга из Supabase
  const fetchRatingData = useCallback(async (type) => {
    try {
      setIsLoading(true)
      setError(null)

      let query

      switch (type) {
        case RATING_TYPES.MINING:
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, mining_power, level")
            .order("mining_power", { ascending: false })
            .limit(100)
          break

        case RATING_TYPES.REFERRALS:
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, referral_count, level")
            .order("referral_count", { ascending: false })
            .limit(100)
          break

        case RATING_TYPES.LEVEL:
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, level, experience")
            .order("level", { ascending: false })
            .order("experience", { ascending: false })
            .limit(100)
          break

        case RATING_TYPES.TASKS:
          // Для рейтинга по заданиям нужно сделать более сложный запрос с подсчетом выполненных заданий
          query = supabase
            .from("user_tasks")
            .select("user_id, users:user_id(id, telegram_id, username, first_name, last_name, photo_url, level)")
            .eq("status", "completed")
            .limit(500)
          break

        default:
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, mining_power, level")
            .order("mining_power", { ascending: false })
            .limit(100)
      }

      const { data, error } = await query

      if (error) throw error

      // Обработка данных для рейтинга по заданиям
      if (type === RATING_TYPES.TASKS) {
        // Группируем задания по пользователям и считаем количество
        const userTasksCount = data.reduce((acc, item) => {
          const userId = item.user_id
          if (!acc[userId]) {
            acc[userId] = {
              ...item.users,
              tasks_completed: 1,
            }
          } else {
            acc[userId].tasks_completed += 1
          }
          return acc
        }, {})

        // Преобразуем в массив и сортируем
        const processedData = Object.values(userTasksCount).sort((a, b) => b.tasks_completed - a.tasks_completed)

        return processedData
      }

      return data
    } catch (err) {
      setError(err.message)
      console.error("Error fetching rating data:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Эффект для загрузки данных при изменении типа рейтинга
  useEffect(() => {
    mutate()
    setCurrentPage(0) // Сбрасываем страницу при смене типа рейтинга

    // Включаем анимацию после небольшой задержки
    setAnimateItems(false)
    const timer = setTimeout(() => {
      setAnimateItems(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [mutate])

  // Функция для отображения значения в зависимости от типа рейтинга
  const getRatingValue = (item) => {
    switch (activeRatingType) {
      case RATING_TYPES.MINING:
        return `${item.mining_power || 0} ⚡`
      case RATING_TYPES.REFERRALS:
        return `${item.referral_count || 0} 👥`
      case RATING_TYPES.LEVEL:
        return `Ур. ${item.level || 1}`
      case RATING_TYPES.TASKS:
        return `${item.tasks_completed || 0} ✅`
      default:
        return `${item.mining_power || 0} ⚡`
    }
  }

  // Функция для отображения имени пользователя
  const getUserName = (item) => {
    if (item.username) return `@${item.username}`
    if (item.first_name) {
      return item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name
    }
    return `User ${item.telegram_id}`
  }

  // Функция для отправки подарка пользователю
  const handleSendGift = (userId) => {
    // Здесь будет логика отправки подарка
    alert(`Подарок отправлен пользователю ${userId}`)
  }

  // Функция для прокрутки к позиции текущего пользователя
  const scrollToCurrentUser = () => {
    if (!currentUserPosition) return

    const index = ratingData.findIndex((item) => item.telegram_id === telegramUser.id || item.id === telegramUser.id)

    if (index !== -1) {
      // Вычисляем страницу, на которой находится пользователь
      const userPage = Math.floor(index / ITEMS_PER_PAGE)
      setCurrentPage(userPage)
      setShowMyPosition(true)

      // Скрываем выделение через 3 секунды
      setTimeout(() => {
        setShowMyPosition(false)
      }, 3000)
    }
  }

  // Обработчик изменения типа рейтинга
  const handleRatingTypeChange = (type) => {
    setActiveRatingType(type)
  }

  // Получаем данные для текущей страницы
  const currentPageData = useMemo(() => {
    if (!ratingData) return []
    const startIndex = currentPage * ITEMS_PER_PAGE
    return ratingData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [ratingData, currentPage])

  // Общее количество страниц
  const totalPages = useMemo(() => {
    if (!ratingData) return 0
    return Math.ceil(ratingData.length / ITEMS_PER_PAGE)
  }, [ratingData])

  // Обработчики пагинации
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="rating-section">
      <div className="rating-header">
        <h2 className="rating-title">Рейтинг игроков</h2>

        {/* Фильтры типов рейтинга */}
        <div className="rating-filters">
          {Object.values(RATING_TYPES).map((type) => (
            <button
              key={type}
              className={`rating-filter-btn ${activeRatingType === type ? "active" : ""}`}
              onClick={() => handleRatingTypeChange(type)}
            >
              <span className="rating-filter-icon">{RATING_ICONS[type]}</span>
              <span className="rating-filter-label">{RATING_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка для прокрутки к позиции текущего пользователя */}
      {currentUserPosition && (
        <button className="find-me-btn" onClick={scrollToCurrentUser}>
          Моя позиция ({currentUserPosition.position})
        </button>
      )}

      {/* Состояние загрузки */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка рейтинга...</p>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="error-state">
          <p>Произошла ошибка при загрузке рейтинга</p>
          <button onClick={() => mutate()}>Попробовать снова</button>
        </div>
      )}

      {/* Список рейтинга с пагинацией */}
      {!isLoading && !error && ratingData && (
        <div className="rating-list-container">
          {currentPageData.map((item, index) => {
            const position = currentPage * ITEMS_PER_PAGE + index + 1
            const isCurrentUser = telegramUser && (item.telegram_id === telegramUser.id || item.id === telegramUser.id)

            return (
              <motion.div
                key={`${item.id || item.telegram_id}-${position}`}
                className={`rating-item ${isCurrentUser ? "current-user" : ""} ${showMyPosition && isCurrentUser ? "highlight-position" : ""}`}
                initial={animateItems ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                {/* Позиция в рейтинге */}
                <div
                  className="position"
                  style={{
                    backgroundColor: position <= 3 ? POSITION_COLORS[position - 1] : undefined,
                  }}
                >
                  {position}
                </div>

                {/* Аватар пользователя */}
                <div className="user-avatar">
                  <OptimizedImage
                    src={item.photo_url || "/placeholder.svg?height=40&width=40"}
                    alt={getUserName(item)}
                    width={40}
                    height={40}
                    className="avatar-image"
                  />
                  {position <= 3 && (
                    <div className="position-badge">{position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉"}</div>
                  )}
                </div>

                {/* Информация о пользователе */}
                <div className="user-info">
                  <span className="username">{getUserName(item)}</span>
                  <span className="user-level">Уровень {item.level || 1}</span>
                </div>

                {/* Значение рейтинга */}
                <div className="rating-value">{getRatingValue(item)}</div>

                {/* Действия с пользователем */}
                <div className="user-actions">
                  {!isCurrentUser && (
                    <button
                      className="gift-button"
                      onClick={() => handleSendGift(item.id || item.telegram_id)}
                      aria-label="Отправить подарок"
                    >
                      🎁
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" onClick={goToPrevPage} disabled={currentPage === 0}>
                &laquo; Назад
              </button>
              <span className="pagination-info">
                {currentPage + 1} из {totalPages}
              </span>
              <button className="pagination-btn" onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
                Вперед &raquo;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Информация о текущем пользователе */}
      {currentUserPosition && (
        <div className="current-user-info">
          <div className="user-position">
            <span>Ваша позиция:</span>
            <span className="position-value">{currentUserPosition.position}</span>
          </div>
          <div className="next-position-info">
            {currentUserPosition.position > 1 && (
              <>
                <span>До следующей позиции:</span>
                <span className="next-position-value">
                  {activeRatingType === RATING_TYPES.MINING &&
                    `${(ratingData[currentUserPosition.position - 2]?.mining_power || 0) - currentUserPosition.mining_power} ⚡`}
                  {activeRatingType === RATING_TYPES.REFERRALS &&
                    `${(ratingData[currentUserPosition.position - 2]?.referral_count || 0) - currentUserPosition.referral_count} 👥`}
                  {activeRatingType === RATING_TYPES.LEVEL &&
                    `${(ratingData[currentUserPosition.position - 2]?.level || 0) - currentUserPosition.level} уровней`}
                  {activeRatingType === RATING_TYPES.TASKS &&
                    `${(ratingData[currentUserPosition.position - 2]?.tasks_completed || 0) - currentUserPosition.tasks_completed} заданий`}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RatingSection

