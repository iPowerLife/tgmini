"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Award, Crown, Star } from "lucide-react"
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
      <div className="px-4 py-4">
        {/* Заголовок */}
        <div className="mb-6 bg-[#1E2235] p-4 rounded-xl shadow-lg">
          <h1 className="text-3xl font-light tracking-wide text-white text-center">Рейтинг Игроков</h1>
        </div>

        {/* Остальной код компонента остается тем же */}
      </div>
    </div>
  )
}

