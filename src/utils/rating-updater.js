import { supabase } from "../supabase"

/**
 * Обновляет кэшированные данные рейтинга
 * @returns {Promise<Object>} Результат операции
 */
export async function updateCachedRatings() {
  try {
    console.log("Начало обновления кэшированного рейтинга...")

    // Вызываем SQL-функцию для обновления рейтинга
    const { data, error } = await supabase.rpc("update_cached_ratings")

    if (error) {
      console.error("Ошибка при обновлении рейтинга:", error)
      return { success: false, error: error.message }
    }

    console.log("Рейтинг успешно обновлен:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Критическая ошибка при обновлении рейтинга:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Получает кэшированные данные рейтинга
 * @param {string} type - Тип рейтинга ('balance' или 'referrals')
 * @returns {Promise<Object>} Данные рейтинга и время последнего обновления
 */
export async function getCachedRatings(type = "balance") {
  try {
    console.log(`Получение кэшированного рейтинга (${type})...`)

    const { data, error } = await supabase.from("cached_ratings").select("*").eq("id", 1).single()

    if (error) {
      console.error("Ошибка при получении кэшированного рейтинга:", error)
      return {
        ratings: [],
        lastUpdate: null,
        error: error.message,
      }
    }

    const ratings = type === "balance" ? data.balance_rating : data.referral_rating

    return {
      ratings: ratings || [],
      lastUpdate: data.updated_at,
      error: null,
    }
  } catch (error) {
    console.error("Критическая ошибка при получении кэшированного рейтинга:", error)
    return {
      ratings: [],
      lastUpdate: null,
      error: error.message,
    }
  }
}

/**
 * Проверяет, нужно ли обновить кэшированные данные
 * @returns {Promise<boolean>} true, если данные устарели или отсутствуют
 */
export async function shouldUpdateRatings() {
  try {
    const { data, error } = await supabase.from("cached_ratings").select("updated_at").eq("id", 1).single()

    if (error || !data) {
      return true
    }

    const lastUpdate = new Date(data.updated_at)
    const now = new Date()

    // Проверяем, прошло ли более 24 часов с последнего обновления
    const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60)

    return hoursSinceLastUpdate >= 24
  } catch (error) {
    console.error("Ошибка при проверке необходимости обновления:", error)
    return true
  }
}

