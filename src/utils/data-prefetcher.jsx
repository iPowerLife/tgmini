"use client"

import { useEffect } from "react"
import { supabase } from "../supabase"
import { clearQueryCache } from "../hooks/use-supabase-query"

/**
 * Компонент для предварительной загрузки данных при запуске приложения
 * @param {Object} props - Свойства компонента
 * @param {string} props.userId - ID пользователя
 * @param {Function} props.onProgress - Функция для отслеживания прогресса загрузки
 * @param {Function} props.onComplete - Функция, вызываемая после завершения загрузки
 */
export function DataPrefetcher({ userId, onProgress, onComplete }) {
  useEffect(() => {
    if (!userId) return

    const prefetchData = async () => {
      try {
        // Очищаем кэш перед загрузкой
        clearQueryCache()

        // Шаг 1: Загрузка данных пользователя (10%)
        onProgress?.({ step: "user", progress: 0.1 })
        await supabase.from("users").select("*").eq("id", userId).single()

        // Шаг 2: Загрузка данных майнинга (30%)
        onProgress?.({ step: "mining", progress: 0.3 })
        const [miningInfoResponse, poolsResponse] = await Promise.all([
          supabase.rpc("get_mining_info_with_rewards", { user_id_param: userId }),
          supabase.from("mining_pools").select("*").order("min_miners"),
        ])

        // Шаг 3: Загрузка майнеров пользователя (50%)
        onProgress?.({ step: "miners", progress: 0.5 })
        await supabase
          .from("user_miners")
          .select(`
            *,
            model:miner_models (
              id,
              name,
              display_name,
              mining_power,
              energy_consumption,
              image_url
            )
          `)
          .eq("user_id", userId)

        // Шаг 4: Загрузка данных магазина (70%)
        onProgress?.({ step: "shop", progress: 0.7 })
        await Promise.all([
          supabase.from("miner_categories").select("*").order("id"),
          supabase.from("miner_models").select("*").order("category_id, price"),
          supabase.from("special_items").select("*").order("price"),
        ])

        // Шаг 5: Загрузка заданий (90%)
        onProgress?.({ step: "tasks", progress: 0.9 })
        await supabase
          .from("tasks")
          .select(`
            *,
            category:task_categories(name, display_name)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        // Завершение загрузки (100%)
        onProgress?.({ step: "complete", progress: 1.0 })
        onComplete?.()
      } catch (error) {
        console.error("Error prefetching data:", error)
        // Даже при ошибке вызываем onComplete, чтобы приложение могло продолжить работу
        onComplete?.()
      }
    }

    prefetchData()
  }, [userId, onProgress, onComplete])

  // Компонент не рендерит ничего
  return null
}

