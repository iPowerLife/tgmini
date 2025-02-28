"use client"

import { useEffect } from "react"

import { useState } from "react"

// Функция для получения тестового пользователя
function getTestUser() {
  return {
    id: 12345,
    first_name: "Тестовый",
    username: "testuser",
    photo_url: null,
    last_name: null,
  }
}

// Функция для инициализации Telegram WebApp
export function initTelegram() {
  try {
    if (!window.Telegram?.WebApp) {
      console.log("ERROR: Telegram WebApp не доступен")
      return null
    }

    const webApp = window.Telegram.WebApp
    webApp.ready()
    webApp.expand()

    console.log("SUCCESS: Telegram WebApp инициализирован")
    return webApp
  } catch (error) {
    console.error("ERROR в initTelegram:", error)
    return null
  }
}

// Функция для получения данных пользователя
export function getTelegramUser() {
  // Проверяем режим разработки
  if (process.env.NODE_ENV === "development") {
    console.log("DEV MODE: Возвращаем тестового пользователя")
    return {
      id: 12345,
      first_name: "Тестовый",
      username: "testuser",
      photo_url: null,
      last_name: null,
    }
  }

  try {
    // Проверяем наличие объекта Telegram
    if (!window.Telegram) {
      console.log("ERROR: window.Telegram не найден")
      return null
    }

    // Проверяем наличие WebApp
    if (!window.Telegram.WebApp) {
      console.log("ERROR: window.Telegram.WebApp не найден")
      return null
    }

    // Проверяем наличие initDataUnsafe
    if (!window.Telegram.WebApp.initDataUnsafe) {
      console.log("ERROR: initDataUnsafe не найден")
      return null
    }

    // Получаем данные пользователя
    const user = window.Telegram.WebApp.initDataUnsafe.user

    // Проверяем наличие пользователя
    if (!user) {
      console.log("ERROR: user не найден в initDataUnsafe")
      return null
    }

    // Проверяем наличие id
    if (!user.id) {
      console.log("ERROR: id не найден в данных пользователя", user)
      return null
    }

    console.log("SUCCESS: Получены данные пользователя:", user)
    return user
  } catch (error) {
    console.error("ERROR в getTelegramUser:", error)
    return null
  }
}

// Хук для получения данных пользователя
export function useTelegramUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const telegram = initTelegram()
    if (telegram) {
      const userData = getTelegramUser()
      if (userData) {
        setUser(userData)
      }
    }
  }, [])

  if (!user) {
    return {
      id: null,
      firstName: "Неизвестно",
      username: null,
      photoUrl: null,
      displayName: "Неизвестный пользователь",
    }
  }

  return {
    id: user.id,
    firstName: user.first_name || "Неизвестно",
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
    displayName: user.username
      ? `@${user.username}`
      : user.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Неизвестный пользователь",
  }
}

// Функция для создания/обновления пользователя в базе
export async function createOrUpdateUser(userData) {
  // Проверяем наличие данных пользователя
  if (!userData) {
    console.error("userData is null")
    throw new Error("Нет данных пользователя")
  }

  if (!userData.id) {
    console.error("userData.id is null", userData)
    throw new Error("Некорректные данные пользователя")
  }

  const supabase = (await import("../supabase")).supabase

  try {
    console.log("Создаем/обновляем пользователя:", userData)

    // Используем upsert для создания или обновления пользователя
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: userData.id,
          username: userData.username || null,
          first_name: userData.first_name || "Неизвестно",
          last_name: userData.last_name || null,
          photo_url: userData.photo_url || null,
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

    console.log("Пользователь успешно сохранен:", data)

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

