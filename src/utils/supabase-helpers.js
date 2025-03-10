import { supabase } from "../supabase"

/**
 * Выполняет запрос к Supabase с обработкой ошибок и повторными попытками
 * @param {Function} queryFn - Функция, выполняющая запрос к Supabase
 * @param {Object} options - Опции запроса
 * @param {number} options.retries - Количество повторных попыток (по умолчанию 3)
 * @param {number} options.retryDelay - Задержка между повторными попытками в мс (по умолчанию 1000)
 * @returns {Promise<Object>} - Результат запроса
 */
export async function executeQuery(queryFn, options = {}) {
  const { retries = 3, retryDelay = 1000 } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await queryFn(supabase)

      if (result.error) {
        throw result.error
      }

      return { data: result.data, error: null }
    } catch (error) {
      console.error(`Query attempt ${attempt + 1}/${retries + 1} failed:`, error)
      lastError = error

      if (attempt < retries) {
        // Ждем перед следующей попыткой
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  return { data: null, error: lastError }
}

/**
 * Выполняет пакетную вставку данных в Supabase
 * @param {string} table - Название таблицы
 * @param {Array} items - Массив объектов для вставки
 * @param {number} batchSize - Размер пакета (по умолчанию 100)
 * @returns {Promise<Object>} - Результат операции
 */
export async function batchInsert(table, items, batchSize = 100) {
  if (!items || items.length === 0) {
    return { data: [], error: null }
  }

  const results = []
  const errors = []

  // Разбиваем массив на пакеты
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, Math.min(i + batchSize, items.length))

    try {
      const { data, error } = await supabase.from(table).insert(batch).select()

      if (error) {
        errors.push(error)
      } else if (data) {
        results.push(...data)
      }
    } catch (error) {
      errors.push(error)
    }
  }

  return {
    data: results,
    error: errors.length > 0 ? errors : null,
    stats: {
      total: items.length,
      inserted: results.length,
      failed: items.length - results.length,
    },
  }
}

/**
 * Кэширует результаты запроса к Supabase
 * @param {Function} queryFn - Функция, выполняющая запрос к Supabase
 * @param {string} cacheKey - Ключ для кэширования
 * @param {number} ttl - Время жизни кэша в миллисекундах (по умолчанию 5 минут)
 * @returns {Promise<Object>} - Результат запроса
 */
export async function cachedQuery(queryFn, cacheKey, ttl = 5 * 60 * 1000) {
  // Проверяем кэш
  const cachedData = localStorage.getItem(`supabase_cache_${cacheKey}`)

  if (cachedData) {
    try {
      const { data, timestamp } = JSON.parse(cachedData)

      // Проверяем, не истек ли срок действия кэша
      if (Date.now() - timestamp < ttl) {
        return { data, error: null, fromCache: true }
      }
    } catch (error) {
      console.error("Error parsing cached data:", error)
    }
  }

  // Выполняем запрос
  const { data, error } = await executeQuery(queryFn)

  if (!error && data) {
    // Сохраняем результат в кэш
    localStorage.setItem(
      `supabase_cache_${cacheKey}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    )
  }

  return { data, error, fromCache: false }
}

