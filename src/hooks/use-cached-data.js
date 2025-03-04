"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Хук для кэширования данных с возможностью обновления
 * @param {Function} fetchFunction - Функция для загрузки данных
 * @param {Array} dependencies - Массив зависимостей для повторной загрузки
 * @param {number} cacheTime - Время кэширования в миллисекундах (по умолчанию 5 минут)
 * @returns {Object} - Объект с данными, состоянием загрузки, ошибкой и функцией обновления
 */
export function useCachedData(fetchFunction, dependencies = [], cacheTime = 5 * 60 * 1000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Используем ref для хранения времени последнего обновления
  const lastFetchTime = useRef(0)
  const cachedData = useRef(null)

  // Функция для загрузки данных
  const fetchData = useCallback(
    async (force = false) => {
      // Проверяем, нужно ли загружать данные
      const now = Date.now()
      if (!force && cachedData.current && now - lastFetchTime.current < cacheTime) {
        setData(cachedData.current)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetchFunction()
        setData(result)
        cachedData.current = result
        lastFetchTime.current = now
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchFunction, cacheTime],
  )

  // Загружаем данные при изменении зависимостей
  useEffect(() => {
    fetchData()
  }, [...dependencies, fetchData])

  // Функция для принудительного обновления данных
  const refresh = () => fetchData(true)

  return { data, loading, error, refresh }
}

