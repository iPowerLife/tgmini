"use client"

import { useSupabaseQuery } from "./use-supabase-query"

/**
 * Хук для получения данных магазина с оптимизированным кэшированием
 * @param {Object} options - Дополнительные опции запроса
 */
export function useShopData(options = {}) {
  // Настройки по умолчанию
  const {
    refetchInterval = 0, // Не обновляем автоматически
    initialData = null,
  } = options

  // Используем оптимизированный хук для запроса
  return useSupabaseQuery(
    "shop-data",
    async (supabase) => {
      // Выполняем запросы параллельно
      const [categoriesResponse, modelsResponse, specialItemsResponse] = await Promise.all([
        supabase.from("miner_categories").select("*").order("id"),
        supabase.from("miner_models").select("*").order("category_id, price"),
        supabase.from("special_items").select("*").order("price"),
      ])

      // Проверяем ошибки
      if (categoriesResponse.error) throw categoriesResponse.error
      if (modelsResponse.error) throw modelsResponse.error
      if (specialItemsResponse.error) throw specialItemsResponse.error

      return {
        data: {
          categories: categoriesResponse.data || [],
          models: modelsResponse.data || [],
          specialItems: specialItemsResponse.data || [],
        },
        error: null,
      }
    },
    {
      refetchInterval,
      initialData,
    },
  )
}

