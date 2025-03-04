"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Trophy, Users, ChevronLeft, ChevronRight, Award, Crown, Star, Sparkles } from "lucide-react"

export function RatingSection({ currentUserId, users = [] }) {
  const [activeTab, setActiveTab] = useState("balance")
  const [sortedUsers, setSortedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const usersPerPage = 10
  const maxUsers = 100 // Ограничиваем до топ-100
  const containerRef = useRef(null)

  // Фильтрация и сортировка пользователей
  useEffect(() => {
    setIsLoading(true)

    // Имитация задержки загрузки для анимации
    setTimeout(() => {
      let filtered = [...users]

      // Сортируем пользователей в зависимости от активной вкладки
      switch (activeTab) {
        case "balance":
          filtered.sort((a, b) => b.balance - a.balance)
          break
        case "referrals":
          filtered.sort((a, b) => b.referral_count - a.referral_count)
          break
        default:
          filtered.sort((a, b) => b.balance - a.balance)
          break
      }

      // Ограничиваем до топ-100
      filtered = filtered.slice(0, maxUsers)

      setSortedUsers(filtered)
      setCurrentPage(1) // Сбрасываем на первую страницу при изменении фильтров
      setIsLoading(false)
    }, 300)
  }, [activeTab, users])

  // Находим позицию текущего пользователя в полном списке (не только в топ-100)
  const findUserRealPosition = useCallback(() => {
    const allUsers = [...users]

    // Сортируем всех пользователей
    if (activeTab === "balance") {
      allUsers.sort((a, b) => b.balance - a.balance)
    } else {
      allUsers.sort((a, b) => b.referral_count - a.referral_count)
    }

    // Находим позицию текущего пользователя
    const position = allUsers.findIndex((user) => user.id === currentUserId) + 1
    return position
  }, [activeTab, users, currentUserId])

  // Находим позицию текущего пользователя в топ-100
  const currentUserPosition = sortedUsers.findIndex((user) => user.id === currentUserId) + 1

  // Получаем реальную позицию пользователя
  const realPosition = findUserRealPosition()

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
    switch (activeTab) {
      case "balance":
        return user.balance.toFixed(2)
      case "referrals":
        return user.referral_count
      default:
        return user.balance.toFixed(2)
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

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="px-4 py-6">
        {/* Заголовок с анимированным градиентом */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x opacity-20 rounded-xl"></div>
          <div className="relative z-10 py-6 px-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Рейтинг игроков</h1>
            <div className="text-lg font-medium text-blue-400">
              {activeTab === "balance" ? "По количеству монет" : "По количеству рефералов"}
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-1.5 flex shadow-xl">
            <button
              onClick={() => setActiveTab("balance")}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 overflow-hidden ${
                activeTab === "balance" ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {activeTab === "balance" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow"></div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>По балансу</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 overflow-hidden ${
                activeTab === "referrals" ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {activeTab === "referrals" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow"></div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>По рефералам</span>
              </div>
            </button>
          </div>
        </div>

        {/* Позиция текущего пользователя */}
        {currentUserPosition > 0 && (
          <div className="relative overflow-hidden rounded-xl mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-gray-900/50"></div>
            <div className="relative z-10 p-4 border border-blue-500/30">
              <div className="text-sm text-blue-300 mb-1 flex items-center">
                <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                <span>Ваша позиция в рейтинге</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-white">{currentUserPosition} место</div>
                  <div className="ml-2 text-sm text-gray-400">из {sortedUsers.length}</div>
                </div>
                <div className="flex items-center bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-500/30">
                  <span className="text-white font-medium">{getMetricValue(sortedUsers[currentUserPosition - 1])}</span>
                  <span className="ml-1 text-blue-300">{getMetricIcon()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список пользователей */}
        <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden mb-6 border border-gray-700/50 shadow-xl">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin-slow"></div>
                <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin-reverse"></div>
              </div>
              <div className="mt-4 text-blue-400">Загрузка рейтинга...</div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div ref={containerRef} className="max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-gray-700/30">
                {getCurrentPageUsers().map((user, index) => {
                  const actualIndex = (currentPage - 1) * usersPerPage + index
                  const achievement = getAchievement(actualIndex)
                  const isTopThree = actualIndex < 3
                  const isCurrentUser = user.id === currentUserId

                  return (
                    <div
                      key={user.id}
                      className={`relative flex items-center p-4 transition-all duration-300 fade-in ${
                        isCurrentUser
                          ? "bg-blue-900/20 border-l-4 border-blue-500 current-user"
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
                        className={`relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          isTopThree ? "bg-gradient-to-r " + getPositionColor(actualIndex) : "bg-gray-800"
                        } text-white`}
                      >
                        {actualIndex + 1}
                      </div>

                      {/* Аватар пользователя */}
                      <div className="flex-shrink-0 ml-3 relative">
                        {user.photo_url ? (
                          <div className="relative">
                            <div
                              className={`absolute inset-0 rounded-full ${isTopThree ? "animate-pulse-glow" : ""}`}
                              style={{
                                boxShadow: isTopThree
                                  ? `0 0 15px 2px rgba(${
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
                              src={user.photo_url || "/placeholder.svg"}
                              alt={user.display_name}
                              className={`w-10 h-10 rounded-full object-cover border-2 ${
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
                            className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 ${
                              actualIndex === 0
                                ? "border-yellow-400"
                                : actualIndex === 1
                                  ? "border-gray-300"
                                  : actualIndex === 2
                                    ? "border-amber-600"
                                    : "border-transparent"
                            }`}
                          >
                            <span className="text-lg font-bold text-gray-300">{user.display_name?.[0] || "?"}</span>
                          </div>
                        )}

                        {isTopThree && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
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
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-white flex items-center">
                          {user.display_name}
                          {achievement && (
                            <div className="ml-2 flex items-center text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300">
                              {getPositionIcon(actualIndex)}
                              <span className="ml-1">{achievement}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
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
            <div className="p-8 text-center text-gray-400">Нет данных для отображения</div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg pagination-button ${
                currentPage === 1
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-gray-300 hover:from-blue-600/30 hover:to-purple-600/30"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>

            <div className="text-sm text-blue-400 bg-gray-800/50 px-3 py-1 rounded-full">
              Страница {currentPage} из {totalPages}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg pagination-button ${
                currentPage === totalPages
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-gray-300 hover:from-blue-600/30 hover:to-purple-600/30"
              }`}
            >
              <span>Вперед</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Реальная позиция пользователя, если он не в топ-100 */}
        {realPosition > maxUsers && (
          <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Ваша реальная позиция в общем рейтинге</div>
              <div className="text-2xl font-bold text-white mb-1">{realPosition} место</div>
              <div className="text-sm text-blue-400">
                Вам нужно{" "}
                {activeTab === "balance"
                  ? `набрать еще ${(users[maxUsers - 1]?.balance || 0) - (users.find((u) => u.id === currentUserId)?.balance || 0)} монет`
                  : `привлечь еще ${(users[maxUsers - 1]?.referral_count || 0) - (users.find((u) => u.id === currentUserId)?.referral_count || 0)} рефералов`}
                , чтобы попасть в топ-100
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

