/**
 * Утилита для управления кэшированием данных рейтинга
 */

// Ключи для хранения кэшированных данных
const CACHE_KEYS = {
  BALANCE_RATING: "cached_balance_rating",
  REFERRAL_RATING: "cached_referral_rating",
  LAST_UPDATE: "rating_last_update",
}

// Интервал обновления (12 часов в миллисекундах)
const UPDATE_INTERVAL = 12 * 60 * 60 * 1000

/**
 * Проверяет, нужно ли обновить кэш
 * @returns {boolean} true, если кэш устарел или отсутствует
 */
export function shouldUpdateCache() {
  try {
    const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE)

    if (!lastUpdate) return true

    const lastUpdateTime = Number.parseInt(lastUpdate, 10)
    const currentTime = Date.now()

    return currentTime - lastUpdateTime > UPDATE_INTERVAL
  } catch (error) {
    console.error("Ошибка при проверке кэша:", error)
    return true
  }
}

/**
 * Получает кэшированные данные рейтинга
 * @param {string} type - Тип рейтинга ('balance' или 'referrals')
 * @returns {Array|null} Массив данных рейтинга или null, если кэш отсутствует
 */
export function getCachedRating(type) {
  try {
    const key = type === "balance" ? CACHE_KEYS.BALANCE_RATING : CACHE_KEYS.REFERRAL_RATING
    const cachedData = localStorage.getItem(key)

    if (!cachedData) return null

    return JSON.parse(cachedData)
  } catch (error) {
    console.error("Ошибка при получении кэша:", error)
    return null
  }
}

/**
 * Сохраняет данные рейтинга в кэш
 * @param {string} type - Тип рейтинга ('balance' или 'referrals')
 * @param {Array} data - Данные рейтинга для кэширования
 */
export function cacheRating(type, data) {
  try {
    const key = type === "balance" ? CACHE_KEYS.BALANCE_RATING : CACHE_KEYS.REFERRAL_RATING
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString())
  } catch (error) {
    console.error("Ошибка при сохранении кэша:", error)
  }
}

/**
 * Получает время последнего обновления кэша в формате даты
 * @returns {string} Дата и время последнего обновления
 */
export function getLastUpdateTime() {
  try {
    const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE)

    if (!lastUpdate) return "Никогда"

    const date = new Date(Number.parseInt(lastUpdate, 10))
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Ошибка при получении времени обновления:", error)
    return "Неизвестно"
  }
}

/**
 * Принудительно очищает кэш рейтинга
 */
export function clearRatingCache() {
  try {
    localStorage.removeItem(CACHE_KEYS.BALANCE_RATING)
    localStorage.removeItem(CACHE_KEYS.REFERRAL_RATING)
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATE)
  } catch (error) {
    console.error("Ошибка при очистке кэша:", error)
  }
}

