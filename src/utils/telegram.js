"use client"

import { useState, useEffect } from "react"

// Функция для инициализации Telegram WebApp
export function initTelegram() {
  if (window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

// Функция для получения данных пользователя из Telegram WebApp
export function getTelegramUser() {
  const telegram = initTelegram()
  if (telegram) {
    return telegram.initDataUnsafe?.user
  }
  return null
}

// Хук для получения данных пользователя из Telegram WebApp
export function useTelegramUser() {
  const [telegramUser, setTelegramUser] = useState(getTelegramUser())

  useEffect(() => {
    const telegram = initTelegram()
    if (telegram) {
      setTelegramUser(telegram.initDataUnsafe?.user)

      // Подписываемся на событие изменения данных
      telegram.onEvent("themeChanged", () => {
        setTelegramUser(telegram.initDataUnsafe?.user)
      })

      telegram.onEvent("viewportChanged", () => {
        setTelegramUser(telegram.initDataUnsafe?.user)
      })
    }
  }, [])

  const displayName = telegramUser?.username
    ? `@${telegramUser.username}`
    : telegramUser?.first_name || "Неизвестный пользователь"

  return {
    ...telegramUser,
    displayName,
    photoUrl: telegramUser?.photo_url,
  }
}

// Функция для создания/обновления пользователя в базе
export async function createOrUpdateUser(userData) {
  if (!userData?.id) {
    throw new Error("Нет данных пользователя")
  }

  const supabase = (await import("../supabase")).supabase

  try {
    // Используем upsert для создания или обновления пользователя
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: userData.id,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          photo_url: userData.photo_url,
          last_seen: new Date().toISOString(),
          // Устанавливаем начальные значения только при создании
          balance: 0,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
        },
        {
          onConflict: "telegram_id",
          // Обновляем только эти поля при конфликте
          update: {
            username: userData.username,
            first_name: userData.first_name,
            last_name: userData.last_name,
            photo_url: userData.photo_url,
            last_seen: new Date().toISOString(),
          },
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Ошибка сохранения пользователя:", error)
      throw error
    }

    // Проверяем/создаем запись в mining_stats
    const { error: statsError } = await supabase.from("mining_stats").upsert(
      {
        user_id: data.id,
        total_mined: 0,
        mining_count: 0,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    )

    if (statsError) {
      console.error("Ошибка создания статистики:", statsError)
      throw statsError
    }

    return data
  } catch (error) {
    console.error("Ошибка в createOrUpdateUser:", error)
    throw error
  }
}

