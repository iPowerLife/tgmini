"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"
import { useSupabaseQuery } from "./use-supabase-query"
import { getTelegramUser } from "../utils/telegram"

/**
 * Хук для получения и управления данными пользователя
 */
export function useUserData() {
  const [telegramUser, setTelegramUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Инициализация пользователя Telegram
  useEffect(() => {
    const initTelegramUser = async () => {
      try {
        const userData = getTelegramUser()
        setTelegramUser(userData)
      } catch (error) {
        console.error("Error getting Telegram user:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initTelegramUser()
  }, [])

  // Получаем данные пользователя из базы данных
  const userQuery = useSupabaseQuery(
    telegramUser ? `user-${telegramUser.id}` : null,
    async (supabase) => {
      // Создаем или обновляем пользователя
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "telegram_id", returning: "representation" },
        )
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    },
    {
      enabled: !!telegramUser,
      refetchInterval: 0, // Не обновляем автоматически
    },
  )

  // Функция для обновления баланса пользователя
  const updateBalance = useCallback(
    async (newBalance) => {
      if (!userQuery.data) return { success: false }

      try {
        const { data, error } = await supabase
          .from("users")
          .update({ balance: newBalance })
          .eq("id", userQuery.data.id)
          .select()
          .single()

        if (error) throw error

        // Обновляем локальные данные
        userQuery.refetch()

        return { success: true, data }
      } catch (error) {
        console.error("Error updating balance:", error)
        return { success: false, error }
      }
    },
    [userQuery.data, userQuery.refetch],
  )

  return {
    user: userQuery.data,
    telegramUser,
    isLoading: isInitializing || userQuery.isLoading,
    error: userQuery.error,
    updateBalance,
    refetch: userQuery.refetch,
  }
}

