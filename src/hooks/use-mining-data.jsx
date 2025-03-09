"use client"

import { useSupabaseQuery } from "./use-supabase-query"
import { supabase } from "../supabase"

/**
 * Хук для получения данных о майнинге с оптимизированным кэшированием
 * @param {string} userId - ID пользователя
 * @param {Object} options - Дополнительные опции запроса
 */
export function useMiningData(userId, options = {}) {
  // Настройки по умолчанию
  const {
    refetchInterval = 60000, // Обновление каждую минуту
    initialData = null,
  } = options

  // Используем оптимизированный хук для запроса
  const result = useSupabaseQuery(
    `mining-data-${userId}`,
    async () => {
      // Выполняем все необходимые запросы параллельно
      const [miningInfoResponse, poolsResponse] = await Promise.all([
        supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        }),
        supabase.from("mining_pools").select("*").order("min_miners"),
      ])

      // Проверяем ошибки
      if (miningInfoResponse.error) throw miningInfoResponse.error
      if (poolsResponse.error) throw poolsResponse.error

      // Объединяем данные
      return {
        data: {
          ...miningInfoResponse.data,
          mining_pools: poolsResponse.data || [],
        },
        error: null,
      }
    },
    {
      enabled: !!userId,
      refetchInterval,
      initialData,
      onSuccess: (data) => {
        console.log("Mining data refreshed successfully")
      },
    },
  )

  // Функция для обновления пула майнинга
  const updateMiningPool = async (poolName) => {
    if (!userId) return { success: false, error: "No user ID provided" }

    try {
      const { data, error } = await supabase.rpc("change_mining_pool", {
        user_id_param: userId,
        pool_name_param: poolName,
      })

      if (error) throw error

      // Принудительно обновляем данные после изменения пула
      result.refetch()

      return { success: true, data }
    } catch (error) {
      console.error("Error changing mining pool:", error)
      return { success: false, error }
    }
  }

  // Функция для сбора наград
  const collectRewards = async () => {
    if (!userId) return { success: false, error: "No user ID provided" }

    try {
      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
      })

      if (error) throw error

      // Принудительно обновляем данные после сбора наград
      result.refetch()

      return { success: true, data }
    } catch (error) {
      console.error("Error collecting rewards:", error)
      return { success: false, error }
    }
  }

  return {
    ...result,
    updateMiningPool,
    collectRewards,
  }
}

