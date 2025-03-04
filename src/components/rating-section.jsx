"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Zap, Diamond, Users, Search, ChevronLeft, ChevronRight, Award } from "lucide-react"

export function RatingSection({ currentUserId, users = [] }) {
  const [activeTab, setActiveTab] = useState("mining")
  const [sortedUsers, setSortedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const usersPerPage = 10

  // Фильтрация и сортировка пользователей
  useEffect(() => {
    setIsLoading(true)

    // Имитация задержки загрузки для анимации
    setTimeout(() => {
      // Фильтруем по поисковому запросу
      let filtered = [...users]
      if (searchQuery.trim()) {
        filtered = users.filter((user) => user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Сортируем пользователей в зависимости от активной вкладки
      switch (activeTab) {
        case "mining":
          filtered.sort((a, b) => b.total_mined - a.total_mined)
          break
        case "power":
          filtered.sort((a, b) => b.mining_power - a.mining_power)
          break
        case "balance":
          filtered.sort((a, b) => b.balance - a.balance)
          break
        case "referrals":
          filtered.sort((a, b) => b.referral_count - a.referral_count)
          break
        default:
          break
      }

      setSortedUsers(filtered)
      setCurrentPage(1) // Сбрасываем на первую страницу при изменении фильтров
      setIsLoading(false)
    }, 300)
  }, [activeTab, users, searchQuery])

  // Находим позицию текущего пользователя
  const currentUserPosition = sortedUsers.findIndex((user) => user.id === currentUserId) + 1

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
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Функция для перехода на предыдущую страницу
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Получаем метрику в зависимости от активной вкладки
  const getMetricLabel = () => {
    switch (activeTab) {
      case "mining":
        return "намайнено"
      case "power":
        return "мощность"
      case "balance":
        return "баланс"
      case "referrals":
        return "рефералов"
      default:
        return ""
    }
  }

  // Получаем иконку для метрики
  const getMetricIcon = () => {
    switch (activeTab) {
      case "mining":
        return "💎"
      case "power":
        return "⚡"
      case "balance":
        return "💰"
      case "referrals":
        return "👥"
      default:
        return ""
    }
  }

  // Получаем значение метрики для пользователя
  const getMetricValue = (user) => {
    switch (activeTab) {
      case "mining":
        return user.total_mined.toFixed(2)
      case "power":
        return user.mining_power.toFixed(3)
      case "balance":
        return user.balance.toFixed(2)
      case "referrals":
        return user.referral_count
      default:
        return 0
    }
  }

  // Получаем достижение для топ-игрока
  const getAchievement = (index) => {
    if (index === 0) return "Лидер рейтинга"
    if (index === 1) return "Серебряный призер"
    if (index === 2) return "Бронзовый призер"
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Рейтинг игроков</h1>

        {/* Вкладки */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("mining")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === "mining"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <Diamond className="w-4 h-4" />
            <span>Намайнено</span>
          </button>

          <button
            onClick={() => setActiveTab("power")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === "power"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Мощность</span>
          </button>

          <button
            onClick={() => setActiveTab("balance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === "balance"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Баланс</span>
          </button>

          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === "referrals"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Рефералы</span>
          </button>
        </div>

        {/* Поиск */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Позиция текущего пользователя */}
        {currentUserPosition > 0 && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 mb-6 animate-pulse-slow">
            <div className="text-sm text-blue-300 mb-1">Ваша позиция в рейтинге</div>
            <div className="flex items-center">
              <div className="text-xl font-bold text-white">{currentUserPosition} место</div>
              <div className="ml-2 text-sm text-gray-400">
                ({getMetricValue(sortedUsers[currentUserPosition - 1])} {getMetricIcon()} {getMetricLabel()})
              </div>
            </div>
          </div>
        )}

        {/* Список пользователей */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden mb-6">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div className="divide-y divide-gray-700/30">
              {getCurrentPageUsers().map((user, index) => {
                const actualIndex = (currentPage - 1) * usersPerPage + index
                const achievement = getAchievement(actualIndex)

                return (
                  <div
                    key={user.id}
                    className={`flex items-center p-4 transition-colors duration-200 ${
                      user.id === currentUserId
                        ? "bg-blue-900/20 border-l-4 border-blue-500"
                        : actualIndex < 3
                          ? "bg-gradient-to-r from-gray-800/30 to-gray-800/10"
                          : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 text-center font-bold ${
                        actualIndex === 0
                          ? "text-yellow-400"
                          : actualIndex === 1
                            ? "text-gray-300"
                            : actualIndex === 2
                              ? "text-amber-600"
                              : "text-gray-400"
                      }`}
                    >
                      {actualIndex + 1}
                    </div>

                    <div className="flex-shrink-0 ml-3 relative">
                      {user.photo_url ? (
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

                      {actualIndex < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          {actualIndex === 0 && <span className="text-yellow-400">🥇</span>}
                          {actualIndex === 1 && <span className="text-gray-300">🥈</span>}
                          {actualIndex === 2 && <span className="text-amber-600">🥉</span>}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="font-medium text-white flex items-center">
                        {user.display_name}
                        {achievement && (
                          <div className="ml-2 flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">
                            <Award className="w-3 h-3 mr-1" />
                            {achievement}
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
          ) : (
            <div className="p-8 text-center text-gray-400">
              {searchQuery ? "Пользователи не найдены" : "Нет данных для отображения"}
            </div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>

            <div className="text-sm text-gray-400">
              Страница {currentPage} из {totalPages}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-800/30 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <span>Вперед</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Добавьте этот стиль в ваш CSS файл
// .animate-pulse-slow {
//   animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }

