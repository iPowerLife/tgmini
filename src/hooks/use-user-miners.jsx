"use client"

import { useSupabaseQuery } from "./use-supabase-query"

/**
 * Хук для получения майнеров пользователя с оптимизированным кэшированием
 * @param {string} userId - ID пользователя
 * @param {Object} options - Дополнительные опции запроса
 */
export function useUserMiners(userId, options = {}) {
  // Настройки по умолчанию
  const {
    refetchInterval = 0, // Не обновляем автоматически
    initialData = null,
  } = options

  // Используем оптимизированный хук для запроса
  return useSupabaseQuery(
    `user-miners-${userId}`,
    async (supabase) => {
      const { data, error } = await supabase
        .from("user_miners")
        .select(`
          *,
          model:miner_models (
            id,
            name,
            display_name,
            mining_power,
            energy_consumption,
            image_url,
            category_id
          )
        `)
        .eq("user_id", userId)
        .order("purchased_at")

      if (error) throw error

      // Рассчитываем общую мощность
      const totalPower = (data || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

      return {
        data: {
          miners: data || [],
          totalPower,
        },
        error: null,
      }
    },
    {
      enabled: !!userId,
      refetchInterval,
      initialData,
    },
  )
}

