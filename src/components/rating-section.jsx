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

// Создаем глобальный кэш для данных рейтинга, чтобы сохранять их между переключениями вкладок
const globalRatingCache = {
  balance: null,
  referrals: null,
}

export function RatingSection() {
  const [activeTab, setActiveTab] = useState("balance")
  const [sortedUsers, setSortedUsers] = useState(() => globalRatingCache[activeTab] || [])
  const [error, setError] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState("Загрузка...")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
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
        // Проверяем наличие данных в глобальном кэше
        if (globalRatingCache[activeTab]) {
          setSortedUsers(globalRatingCache[activeTab])
          setLastUpdateTime(getLastUpdateTime())
          setIsInitialLoad(false)
          return
        }

        // Проверяем наличие кэша и его актуальность
        const shouldUpdate = shouldUpdateCache()
        const cachedData = getCachedRating(activeTab)

        // Если кэш актуален и данные есть, используем их
        if (!shouldUpdate && cachedData) {
          setSortedUsers(cachedData)
          // Сохраняем в глобальный кэш
          globalRatingCache[activeTab] = cachedData
          setLastUpdateTime(getLastUpdateTime())
          setIsInitialLoad(false)
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

        // Сохраняем в глобальный кэш
        globalRatingCache[activeTab] = processedData

        // Обновляем состояние компонента
        setSortedUsers(processedData)
        setLastUpdateTime(getLastUpdateTime())
        setIsInitialLoad(false)
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err.message || "Не удалось загрузить данные рейтинга")
        setIsInitialLoad(false)
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
      {/* Добавляем максимальную ширину и центрирование */}
      <div className="w-full max-w-[380px] mx-auto px-2 py-4 sm:px-4">
        {/* Заголовок и навигация */}
        <div className="mb-4 bg-gradient-to-b from-[#1E2235] to-[#1A1C2E] p-3 sm:p-4 rounded-2xl shadow-lg border border-gray-800/50">
          <h1 className="text-xl sm:text-2xl font-light tracking-wider text-white/90 text-center mb-3">
            Рейтинг Игроков
          </h1>

          {/* Кнопки навигации */}
          <div className="flex gap-1 p-1 bg-[#1E2235]/50 rounded-full">
            <button
              onClick={() => setActiveTab("balance")}
              className={`group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-all flex-1 relative overflow-hidden ${
                activeTab === "balance"
                  ? "bg-gradient-to-r from-[#4171BE] to-[#5B9CE6] text-white shadow-[0_0_15px_rgba(91,156,230,0.25)]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === "balance" ? "text-white" : "text-gray-500"}`} />
              <span className="relative z-10">По балансу</span>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-all flex-1 relative overflow-hidden ${
                activeTab === "referrals"
                  ? "bg-gradient-to-r from-[#4171BE] to-[#5B9CE6] text-white shadow-[0_0_15px_rgba(91,156,230,0.25)]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === "referrals" ? "text-white" : "text-gray-500"}`} />
              <span className="relative z-10">По рефералам</span>
            </button>
          </div>

          {/* Позиция пользователя */}
          {currentUserPosition && currentUserPosition > 0 && currentUser && (
            <div className="mt-3 pt-3 border-t border-gray-700/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 bg-[#2B2D35]/80 px-3 py-2 rounded-xl flex-1">
                  <Sparkles className="w-4 h-4 text-[#5B9CE6]" />
                  <span className="text-sm text-white/90">
                    {currentUserPosition} место из {sortedUsers.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#2B2D35] to-[#323544] px-3 py-2 rounded-xl border border-gray-700/30">
                  <span className="text-sm font-medium text-white/90">{getMetricValue(currentUser)}</span>
                  <span className="text-sm text-[#5B9CE6]">{getMetricIcon()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Список пользователей */}
        <div className="bg-[#1E2235] rounded-2xl overflow-hidden mb-3 shadow-lg border border-gray-800/50">
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-400 mb-2">{error}</div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div ref={containerRef} className="max-h-[65vh] overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-gray-700/30">
                {sortedUsers.map((user, index) => {
                  const isTopThree = index < 3
                  const isCurrentUser = currentUserId && String(user.id) === String(currentUserId)

                  return (
                    <div
                      key={user.id}
                      className={`relative flex items-center p-3 ${
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
                        className={`relative flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-xl font-bold ${
                          isTopThree ? "bg-gradient-to-r " + getPositionColor(index) : "bg-gray-800"
                        } text-white text-sm`}
                      >
                        {index + 1}
                      </div>

                      {/* Аватар пользователя */}
                      <div className="flex-shrink-0 ml-3 relative">
                        {user.photo_url ? (
                          <div className="relative">
                            <img
                              src={user.photo_url || "/placeholder.svg?height=32&width=32"}
                              alt={user.display_name}
                              className={`w-9 h-9 rounded-xl object-cover border-2 ${
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
                            className={`w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center border-2 ${
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
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-base font-bold">
                            {index === 0 && <span className="text-yellow-400">🥇</span>}
                            {index === 1 && <span className="text-gray-300">🥈</span>}
                            {index === 2 && <span className="text-amber-600">🥉</span>}
                          </div>
                        )}
                      </div>

                      {/* Информация о пользователе */}
                      <div className="ml-3 flex-1 min-w-0">
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
          ) : !isInitialLoad ? (
            <div className="p-4 text-center text-gray-400 text-sm">Нет данных для отображения</div>
          ) : null}
        </div>

        {/* Реальная позиция пользователя, если он не в топ-100 */}
        {currentUser && currentUserPosition === null && lastTopUser && (
          <div className="bg-[#1E2235] rounded-2xl p-4 shadow-lg border border-gray-800/50">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Ваша позиция в общем рейтинге</div>
              <div className="text-lg font-bold text-white mb-1">Ниже топ-100</div>
              <div className="text-sm text-blue-400">
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

