"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Trophy, Users, ChevronLeft, ChevronRight, Award, Crown, Star, Sparkles, RefreshCw, Clock } from "lucide-react"
import { supabase } from "../supabase"
import { useTelegramUser } from "../hooks/use-telegram-user"
import { shouldUpdateCache, getCachedRating, cacheRating, getLastUpdateTime } from "../utils/cache-manager"

export function RatingSection() {
  const [activeTab, setActiveTab] = useState("balance")
  const [sortedUsers, setSortedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState("Загрузка...")
  const [isForceUpdating, setIsForceUpdating] = useState(false)
  const usersPerPage = 10
  const maxUsers = 100
  const containerRef = useRef(null)

  // Получаем данные пользователя из Telegram
  const telegramUser = useTelegramUser()
  const currentUserId = telegramUser?.id || null

  // Загрузка данных пользователей
  useEffect(() => {
    async function fetchUsers(forceUpdate = false) {
      try {
        setIsLoading(true)
        setError(null)

        // Проверяем наличие кэша и его актуальность
        const shouldUpdate = forceUpdate || shouldUpdateCache()
        const cachedData = getCachedRating(activeTab)

        // Если кэш актуален и данные есть, используем их
        if (!shouldUpdate && cachedData) {
          setSortedUsers(cachedData)
          setLastUpdateTime(getLastUpdateTime())
          setIsLoading(false)
          return
        }

        // Если кэш устарел или отсутствует, делаем запрос к базе данных
        let query

        if (activeTab === "balance") {
          // Запрос для рейтинга по балансу
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, balance, level, nickname")
            .order("balance", { ascending: false })
            .limit(maxUsers)
        } else {
          // Запрос для рейтинга по рефералам
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, referral_count, level, nickname")
            .order("referral_count", { ascending: false })
            .limit(maxUsers)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) {
          throw supabaseError
        }

        if (!data) {
          throw new Error("Нет данных")
        }

        // Преобразуем данные для отображения
        const processedData = data.map((user) => ({
          id: user.telegram_id || user.id,
          display_name: getUserDisplayName(user),
          photo_url: user.photo_url,
          balance: user.balance || 0,
          referral_count: user.referral_count || 0,
          level: user.level || 1,
          nickname: user.nickname, // Добавляем nickname в обработанные данные
        }))

        // Сохраняем данные в кэш
        cacheRating(activeTab, processedData)

        // Обновляем состояние компонента
        setSortedUsers(processedData)
        setLastUpdateTime(getLastUpdateTime())
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err.message || "Не удалось загрузить данные рейтинга")
      } finally {
        setIsLoading(false)
        setIsForceUpdating(false)
      }
    }

    fetchUsers(isForceUpdating)
  }, [activeTab, isForceUpdating])

  // Функция для принудительного обновления данных
  const forceUpdate = () => {
    setIsForceUpdating(true)
  }

  // Функция для получения отображаемого имени пользователя
  function getUserDisplayName(user) {
    if (!user) return "Неизвестный пользователь"

    // Приоритет отображения: nickname > first_name + last_name > username > id
    if (user.nickname) return user.nickname
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name
    }
    if (user.username) return `@${user.username}`
    return `Пользователь ${user.telegram_id || user.id}`
  }

  // Находим позицию текущего пользователя в списке
  const findUserRealPosition = useCallback(() => {
    if (!currentUserId || sortedUsers.length === 0) return null

    const position = sortedUsers.findIndex((user) => String(user.id) === String(currentUserId)) + 1
    return position > 0 ? position : null
  }, [sortedUsers, currentUserId])

  // Находим позицию текущего пользователя
  const currentUserPosition = findUserRealPosition()

  // Получаем пользователей для текущей страницы
  const getCurrentPageUsers = useCallback(() => {
    const startIndex = (currentPage - 1) * usersPerPage
    return sortedUsers.slice(startIndex, startIndex + usersPerPage)
  }, [currentPage, sortedUsers])

  // Общее количество страниц
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)

  // Функция для перехода на следующую страницу
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  // Функция для перехода на предыдущую страницу
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  // Получаем метрику в зависимости от активной вкладки
  const getMetricLabel = () => {
    switch (activeTab) {
      case "balance":
        return "монет"
      case "referrals":
        return "рефералов"
      default:
        return "монет"
    }
  }

  // Получаем иконку для метрики
  const getMetricIcon = () => {
    switch (activeTab) {
      case "balance":
        return "💰"
      case "referrals":
        return "👥"
      default:
        return "💰"
    }
  }

  // Получаем значение метрики для пользователя
  const getMetricValue = (user) => {
    if (!user) return "0"
    switch (activeTab) {
      case "balance":
        return (user.balance || 0).toFixed(2)
      case "referrals":
        return user.referral_count || 0
      default:
        return (user.balance || 0).toFixed(2)
    }
  }

  // Получаем достижение для топ-игрока
  const getAchievement = (index) => {
    if (index === 0) return "Лидер рейтинга"
    if (index === 1) return "Серебряный призер"
    if (index === 2) return "Бронзовый призер"
    return null
  }

  // Получаем цвет для топ-позиций
  const getPositionColor = (index) => {
    if (index === 0) return "from-yellow-400 to-amber-300"
    if (index === 1) return "from-gray-300 to-gray-400"
    if (index === 2) return "from-amber-600 to-amber-500"
    return "from-blue-600/20 to-purple-600/20"
  }

  // Получаем иконку для топ-позиций
  const getPositionIcon = (index) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />
    if (index === 1) return <Star className="w-4 h-4 text-gray-300" />
    if (index === 2) return <Award className="w-4 h-4 text-amber-600" />
    return null
  }

  // Получаем текущего пользователя
  const currentUser = currentUserId ? sortedUsers.find((user) => String(user.id) === String(currentUserId)) : null

  // Получаем пользователя на последнем месте в топ-100
  const lastTopUser = sortedUsers.length > 0 ? sortedUsers[sortedUsers.length - 1] : null

  // Если данные Telegram не загружены, показываем загрузку
  if (isLoading && !telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin-slow"></div>
          </div>
          <div className="text-blue-400">Загрузка данных...</div>
        </div>
      </div>
    )
  }

  // Основной рендер компонента
  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="px-2 py-3">
        {/* Заголовок с анимированным градиентом */}
        <div className="relative mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x opacity-20 rounded-lg"></div>
          <div className="relative z-10 py-3 px-3 text-center">
            <h1 className="text-xl font-bold text-white mb-1">Рейтинг игроков</h1>
            <div className="text-sm font-medium text-blue-400">
              {activeTab === "balance" ? "По количеству монет" : "По количеству рефералов"}
            </div>

            {/* Информация о последнем обновлении */}
            <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Обновлено: {lastUpdateTime}</span>
              <button
                onClick={forceUpdate}
                disabled={isLoading || isForceUpdating}
                className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                title="Обновить данные"
              >
                <RefreshCw className={`w-3 h-3 ${isForceUpdating ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-lg p-1 flex shadow-lg">
            <button
              onClick={() => setActiveTab("balance")}
              className={`relative flex items-center gap-1 px-3 py-2 rounded-md font-medium transition-all duration-300 overflow-hidden ${
                activeTab === "balance" ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {activeTab === "balance" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow"></div>
              )}
              <div className="relative z-10 flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm">По балансу</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`relative flex items-center gap-1 px-3 py-2 rounded-md font-medium transition-all duration-300 overflow-hidden ${
                activeTab === "referrals" ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {activeTab === "referrals" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow"></div>
              )}
              <div className="relative z-10 flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">По рефералам</span>
              </div>
            </button>
          </div>
        </div>

        {/* Позиция текущего пользователя */}
        {currentUserPosition && currentUserPosition > 0 && currentUser && (
          <div className="relative overflow-hidden rounded-lg mb-3 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-gray-900/50"></div>
            <div className="relative z-10 p-2 border border-blue-500/30">
              <div className="text-xs text-blue-300 mb-0.5 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                <span>Ваша позиция в рейтинге</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-lg font-bold text-white">{currentUserPosition} место</div>
                  <div className="ml-1 text-xs text-gray-400">из {sortedUsers.length}</div>
                </div>
                <div className="flex items-center bg-blue-900/50 px-2 py-1 rounded-full border border-blue-500/30">
                  <span className="text-sm text-white font-medium">{getMetricValue(currentUser)}</span>
                  <span className="ml-1 text-blue-300">{getMetricIcon()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список пользователей */}
        <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-lg overflow-hidden mb-3 border border-gray-700/50 shadow-lg">
          {isLoading ? (
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin-slow"></div>
                <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin-reverse"></div>
              </div>
              <div className="mt-3 text-sm text-blue-400">Загрузка рейтинга...</div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-400 mb-2">{error}</div>
              <button onClick={forceUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                Попробовать снова
              </button>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div ref={containerRef} className="max-h-[50vh] overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-gray-700/30">
                {getCurrentPageUsers().map((user, index) => {
                  const actualIndex = (currentPage - 1) * usersPerPage + index
                  const achievement = getAchievement(actualIndex)
                  const isTopThree = actualIndex < 3
                  const isCurrentUser = currentUserId && String(user.id) === String(currentUserId)

                  return (
                    <div
                      key={user.id}
                      className={`relative flex items-center p-2 transition-all duration-300 fade-in ${
                        isCurrentUser
                          ? "bg-blue-900/20 border-l-2 border-blue-500 current-user"
                          : isTopThree
                            ? `bg-gradient-to-r from-gray-800/50 to-gray-900/50 top-position`
                            : "hover:bg-gray-800/30"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Фоновый градиент для топ-3 */}
                      {isTopThree && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${getPositionColor(actualIndex)} opacity-10`}
                        ></div>
                      )}

                      {/* Номер позиции */}
                      <div
                        className={`relative flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                          isTopThree ? "bg-gradient-to-r " + getPositionColor(actualIndex) : "bg-gray-800"
                        } text-white text-xs`}
                      >
                        {actualIndex + 1}
                      </div>

                      {/* Аватар пользователя */}
                      <div className="flex-shrink-0 ml-2 relative">
                        {user.photo_url ? (
                          <div className="relative">
                            <div
                              className={`absolute inset-0 rounded-full ${isTopThree ? "animate-pulse-glow" : ""}`}
                              style={{
                                boxShadow: isTopThree
                                  ? `0 0 10px 2px rgba(${
                                      actualIndex === 0
                                        ? "255, 215, 0"
                                        : actualIndex === 1
                                          ? "192, 192, 192"
                                          : "205, 127, 50"
                                    }, 0.5)`
                                  : "none",
                              }}
                            ></div>
                            <img
                              src={user.photo_url || "/placeholder.svg?height=32&width=32"}
                              alt={user.display_name}
                              className={`w-8 h-8 rounded-full object-cover border-2 ${
                                actualIndex === 0
                                  ? "border-yellow-400"
                                  : actualIndex === 1
                                    ? "border-gray-300"
                                    : actualIndex === 2
                                      ? "border-amber-600"
                                      : "border-transparent"
                              }`}
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 ${
                              actualIndex === 0
                                ? "border-yellow-400"
                                : actualIndex === 1
                                  ? "border-gray-300"
                                  : actualIndex === 2
                                    ? "border-amber-600"
                                    : "border-transparent"
                            }`}
                          >
                            <span className="text-sm font-bold text-gray-300">{user.display_name?.[0] || "?"}</span>
                          </div>
                        )}

                        {isTopThree && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">
                            {actualIndex === 0 && <span className="text-yellow-400 animate-bounce-slow">🥇</span>}
                            {actualIndex === 1 && (
                              <span className="text-gray-300 animate-bounce-slow" style={{ animationDelay: "0.1s" }}>
                                🥈
                              </span>
                            )}
                            {actualIndex === 2 && (
                              <span className="text-amber-600 animate-bounce-slow" style={{ animationDelay: "0.2s" }}>
                                🥉
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Информация о пользователе */}
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="font-medium text-white flex items-center text-sm truncate">
                          {user.display_name}
                          {achievement && (
                            <div className="ml-1 flex items-center text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300">
                              {getPositionIcon(actualIndex)}
                              <span className="ml-0.5 text-[10px]">{achievement}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <span className="mr-1">{getMetricValue(user)}</span>
                          <span>{getMetricIcon()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">Нет данных для отображения</div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md pagination-button text-sm ${
                currentPage === 1
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-gray-300 hover:from-blue-600/30 hover:to-purple-600/30"
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Назад</span>
            </button>

            <div className="text-xs text-blue-400 bg-gray-800/50 px-2 py-1 rounded-full">
              {currentPage} из {totalPages}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md pagination-button text-sm ${
                currentPage === totalPages
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-gray-300 hover:from-blue-600/30 hover:to-purple-600/30"
              }`}
            >
              <span>Вперед</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Реальная позиция пользователя, если он не в топ-100 */}
        {currentUser && currentUserPosition === null && lastTopUser && (
          <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Ваша позиция в общем рейтинге</div>
              <div className="text-lg font-bold text-white mb-0.5">Ниже топ-100</div>
              <div className="text-xs text-blue-400">
                Вам нужно{" "}
                {activeTab === "balance"
                  ? `набрать еще ${(lastTopUser.balance || 0) - (currentUser.balance || 0)} монет`
                  : `привлечь еще ${(lastTopUser.referral_count || 0) - (currentUser.referral_count || 0)} рефералов`}
                , чтобы попасть в топ-100
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

