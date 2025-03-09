"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"

/**
 * Хук для оптимизированных запросов к Supabase с кэшированием и дедупликацией
 * @param {string} queryKey - Уникальный ключ для идентификации запроса (для кэширования)
 * @param {Function} queryFn - Функция, выполняющая запрос к Supabase
 * @param {Object} options - Дополнительные опции
 */
export function useSupabaseQuery(queryKey, queryFn, options = {}) {
  const {
    enabled = true,
    refetchInterval = 0,
    cacheTime = 5 * 60 * 1000, // 5 минут по умолчанию
    onSuccess = null,
    onError = null,
    initialData = undefined,
  } = options

  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  // Создаем стабильную функцию запроса
  const fetchData = useCallback(
    async (force = false) => {
      // Если запрос отключен, не выполняем его
      if (!enabled) return

      // Проверяем кэш, если запрос не принудительный
      if (!force) {
        const cachedData = getCachedData(queryKey)
        if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
          setData(cachedData.data)
          setIsLoading(false)
          return
        }
      }

      setIsLoading(true)

      try {
        // Выполняем запрос
        const result = await queryFn(supabase)

        // Обрабатываем ошибки Supabase
        if (result.error) {
          throw result.error
        }

        // Обновляем состояние и кэш
        setData(result.data)
        setError(null)

        // Кэшируем результат
        cacheData(queryKey, result.data)
        setLastFetchTime(Date.now())

        // Вызываем колбэк успеха, если он предоставлен
        if (onSuccess) {
          onSuccess(result.data)
        }
      } catch (err) {
        console.error(`Error in query ${queryKey}:`, err)
        setError(err)

        // Вызываем колбэк ошибки, если он предоставлен
        if (onError) {
          onError(err)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [queryKey, queryFn, enabled, cacheTime, onSuccess, onError],
  )

  // Выполняем запрос при монтировании компонента
  useEffect(() => {
    fetchData()

    // Настраиваем интервал обновления, если он указан
    let intervalId
    if (refetchInterval > 0) {
      intervalId = setInterval(() => {
        fetchData()
      }, refetchInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fetchData, refetchInterval])

  // Функция для принудительного обновления данных
  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { data, error, isLoading, refetch, lastFetchTime }
}

// Простая реализация кэша в памяти
const queryCache = new Map()

function getCachedData(queryKey) {
  return queryCache.get(queryKey)
}

function cacheData(queryKey, data) {
  queryCache.set(queryKey, {
    data,
    timestamp: Date.now(),
  })
}

// Функция для очистки кэша
export function clearQueryCache(queryKey = null) {
  if (queryKey) {
    queryCache.delete(queryKey)
  } else {
    queryCache.clear()
  }
}

// Функция для получения всех ключей кэша
export function getQueryCacheKeys() {
  return Array.from(queryCache.keys())
}

