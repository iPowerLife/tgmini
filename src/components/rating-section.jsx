"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Trophy, Users, Award, Crown, Star, Sparkles } from "lucide-react"
import { supabase } from "../supabase"
import { useTelegramUser } from "../hooks/use-telegram-user"
import {
  shouldUpdateCache,
  getCachedRating,
  cacheRating,
  getLastUpdateTime,
  clearRatingCache,
} from "../utils/cache-manager"

export function RatingSection() {
  const [activeTab, setActiveTab] = useState("balance")
  const [sortedUsers, setSortedUsers] = useState([])
  const [error, setError] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState("Загрузка...")
  const maxUsers = 100
  const containerRef = useRef(null)

  // Получаем данные пользователя из Telegram
  const telegramUser = useTelegramUser()
  const currentUserId = telegramUser?.id || null

  // При первой загрузке компонента очищаем кэш, чтобы применить новую логику отображения имен
  useEffect(() => {
    // Очищаем кэш при первой загрузке компонента
    clearRatingCache()
  }, [])

  // Загрузка данных пользователей
  useEffect(() => {
    async function fetchUsers() {
      try {
        // Проверяем наличие кэша и его актуальность
        const shouldUpdate = shouldUpdateCache()
        const cachedData = getCachedRating(activeTab)

        // Если кэш актуален и данные есть, используем их
        if (!shouldUpdate && cachedData) {
          setSortedUsers(cachedData)
          setLastUpdateTime(getLastUpdateTime())
          return
        }

        // Если кэш устарел или отсутствует, делаем запрос к базе данных
        let query

        if (activeTab === "balance") {
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, balance, level")
            .order("balance", { ascending: false })
            .limit(maxUsers)
        } else {
          query = supabase
            .from("users")
            .select("id, telegram_id, username, first_name, last_name, photo_url, referral_count, level")
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
        const processedData = data.map((user) => {
          const displayName = getUserDisplayName(user)

          return {
            id: user.telegram_id || user.id,
            display_name: displayName,
            photo_url: user.photo_url,
            balance: user.balance || 0,
            referral_count: user.referral_count || 0,
            level: user.level || 1,
          }
        })

        // Сохраняем данные в кэш
        cacheRating(activeTab, processedData)

        // Обновляем состояние компонента
        setSortedUsers(processedData)
        setLastUpdateTime(getLastUpdateTime())
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err.message || "Не удалось загрузить данные рейтинга")
      }
    }

    fetchUsers()
  }, [activeTab])

  // Функция для получения отображаемого имени пользователя
  function getUserDisplayName(user) {
    if (!user) return "Неизвестный пользователь"

    if (user.first_name) {
      return user.first_name
    }

    if (user.username) {
      return user.username.replace("@", "")
    }

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

  // Получаем метрику в зависимости от активной вкладки
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

  // Основной рендер компонента
  return (
    <div className="min-h-screen pb-12">
      <div className="px-4 py-4">
        {/* Заголовок */}
        <div className="mb-6 bg-[#1E2235] p-4 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-1">Рейтинг игроков</h1>
          <div className="text-[#5B9CE6] text-sm font-medium">
            {activeTab === "balance" ? "По количеству монет" : "По количеству рефералов"}
          </div>

          {/* Информация об обновлении */}
          <div className="flex items-center mt-2 text-xs">
            <div className="text-gray-400">Обновлено: {lastUpdateTime}</div>
            <div className="text-[#5B9CE6] ml-2">(обновляется раз в 12 часов)</div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-4 bg-[#1E2235] p-1 rounded-xl shadow-lg">
          <button
            onClick={() => setActiveTab("balance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all flex-1 ${
              activeTab === "balance" ? "bg-[#5B9CE6] text-white" : "text-gray-400 hover:bg-[#2B2D35]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>По балансу</span>
          </button>

          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all flex-1 ${
              activeTab === "referrals" ? "bg-[#5B9CE6] text-white" : "text-gray-400 hover:bg-[#2B2D35]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>По рефералам</span>
          </button>
        </div>

        {/* Позиция текущего пользователя */}
        {currentUserPosition && currentUserPosition > 0 && currentUser && (
          <div className="relative overflow-hidden rounded-xl mb-3 group bg-[#1E2235] shadow-lg">
            <div className="relative z-10 p-3">
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
        <div className="bg-[#1E2235] rounded-xl overflow-hidden mb-3 shadow-lg">
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-400 mb-2">{error}</div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div ref={containerRef} className="max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-gray-700/30">
                {sortedUsers.map((user, index) => {
                  const isTopThree = index < 3
                  const isCurrentUser = currentUserId && String(user.id) === String(currentUserId)

                  return (
                    <div
                      key={user.id}
                      className={`relative flex items-center p-2 ${
                        isCurrentUser
                          ? "bg-blue-900/20 border-l-2 border-blue-500"
                          : isTopThree
                            ? `bg-gradient-to-r from-gray-800/50 to-gray-900/50`
                            : "hover:bg-gray-800/30"
                      }`}
                    >
                      {/* Фоновый градиент для топ-3 */}
                      {isTopThree && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${getPositionColor(index)} opacity-10`}
                        ></div>
                      )}

                      {/* Номер позиции */}
                      <div
                        className={`relative flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                          isTopThree ? "bg-gradient-to-r " + getPositionColor(index) : "bg-gray-800"
                        } text-white text-xs`}
                      >
                        {index + 1}
                      </div>

                      {/* Аватар пользователя */}
                      <div className="flex-shrink-0 ml-2 relative">
                        {user.photo_url ? (
                          <div className="relative">
                            <img
                              src={user.photo_url || "/placeholder.svg?height=32&width=32"}
                              alt={user.display_name}
                              className={`w-8 h-8 rounded-full object-cover border-2 ${
                                index === 0
                                  ? "border-yellow-400"
                                  : index === 1
                                    ? "border-gray-300"
                                    : index === 2
                                      ? "border-amber-600"
                                      : "border-transparent"
                              }`}
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 ${
                              index === 0
                                ? "border-yellow-400"
                                : index === 1
                                  ? "border-gray-300"
                                  : index === 2
                                    ? "border-amber-600"
                                    : "border-transparent"
                            }`}
                          >
                            <span className="text-sm font-bold text-gray-300">{user.display_name?.[0] || "?"}</span>
                          </div>
                        )}

                        {isTopThree && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">
                            {index === 0 && <span className="text-yellow-400">🥇</span>}
                            {index === 1 && <span className="text-gray-300">🥈</span>}
                            {index === 2 && <span className="text-amber-600">🥉</span>}
                          </div>
                        )}
                      </div>

                      {/* Информация о пользователе */}
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="font-medium text-white flex items-center text-sm truncate">
                          {user.display_name}
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

        {/* Реальная позиция пользователя, если он не в топ-100 */}
        {currentUser && currentUserPosition === null && lastTopUser && (
          <div className="bg-[#1E2235] rounded-xl p-3 shadow-lg">
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

