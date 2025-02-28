"use client"

// Функция для получения тестового пользователя
function getTestUser() {
  console.log("Возвращаем тестового пользователя")
  return {
    id: 123456789,
    first_name: "Тестовый",
    username: "testuser",
    photo_url: null,
    last_name: null,
  }
}

// Функция для инициализации Telegram WebApp
export function initTelegram() {
  console.log("Начинаем инициализацию Telegram WebApp...")

  // Проверяем наличие объекта window
  if (typeof window === "undefined") {
    console.log("window не определен (серверный рендеринг)")
    return null
  }

  // Проверяем наличие Telegram
  if (!window.Telegram) {
    console.log("window.Telegram не найден")
    return null
  }

  // Проверяем наличие WebApp
  if (!window.Telegram.WebApp) {
    console.log("window.Telegram.WebApp не найден")
    return null
  }

  const webApp = window.Telegram.WebApp
  console.log("WebApp найден:", webApp)

  try {
    webApp.ready()
    webApp.expand()
    console.log("WebApp успешно инициализирован")
    return webApp
  } catch (error) {
    console.error("Ошибка при инициализации WebApp:", error)
    return null
  }
}

// Функция для получения данных пользователя
export function getTelegramUser() {
  console.log("Начинаем получение данных пользователя...")

  // В режиме разработки возвращаем тестового пользователя
  if (process.env.NODE_ENV === "development") {
    console.log("Режим разработки - возвращаем тестового пользователя")
    return getTestUser()
  }

  const webApp = window.Telegram?.WebApp
  console.log("WebApp:", webApp)

  if (!webApp) {
    console.log("WebApp не найден, возвращаем тестового пользователя")
    return getTestUser()
  }

  const initData = webApp.initData
  console.log("initData:", initData)

  const initDataUnsafe = webApp.initDataUnsafe
  console.log("initDataUnsafe:", initDataUnsafe)

  if (!initDataUnsafe?.user) {
    console.log("Данные пользователя не найдены, возвращаем тестового пользователя")
    return getTestUser()
  }

  const user = initDataUnsafe.user
  console.log("Получены данные пользователя:", user)

  return user
}

// Функция для создания/обновления пользователя в базе
export async function createOrUpdateUser(userData) {
  console.log("=== Начало createOrUpdateUser ===")
  console.log("Входные данные:", userData)

  if (!userData) {
    console.error("userData отсутствует")
    return null
  }

  if (!userData.id) {
    console.error("id отсутствует в данных пользователя:", userData)
    return null
  }

  try {
    const supabase = (await import("../supabase")).supabase
    console.log("Supabase клиент инициализирован")

    // Проверяем подключение к базе данных
    const { data: healthCheck, error: healthError } = await supabase
      .from("users")
      .select("count(*)", { count: "exact" })
      .limit(0)

    if (healthError) {
      console.error("Ошибка подключения к базе данных:", healthError)
      throw new Error("Ошибка подключения к базе данных")
    }

    console.log("Подключение к базе данных успешно")

    // Подготавливаем данные пользователя
    const userDataToSave = {
      telegram_id: userData.id,
      username: userData.username || null,
      first_name: userData.first_name || "Неизвестно",
      last_name: userData.last_name || null,
      photo_url: userData.photo_url || null,
      last_seen: new Date().toISOString(),
    }

    console.log("Подготовленные данные для сохранения:", userDataToSave)

    // Пробуем найти существующего пользователя
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", userData.id)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Ошибка при поиске пользователя:", selectError)
      throw new Error(`Ошибка при поиске пользователя: ${selectError.message}`)
    }

    let result

    if (existingUser) {
      console.log("Обновляем существующего пользователя:", existingUser)

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update(userDataToSave)
        .eq("telegram_id", userData.id)
        .select()
        .single()

      if (updateError) {
        console.error("Ошибка при обновлении пользователя:", updateError)
        throw new Error(`Ошибка при обновлении пользователя: ${updateError.message}`)
      }

      result = updatedUser
      console.log("Пользователь успешно обновлен:", result)
    } else {
      console.log("Создаем нового пользователя")

      // Добавляем начальные значения для нового пользователя
      const newUserData = {
        ...userDataToSave,
        balance: 0,
        mining_power: 1,
        level: 1,
        experience: 0,
        next_level_exp: 100,
      }

      const { data: newUser, error: insertError } = await supabase.from("users").insert([newUserData]).select().single()

      if (insertError) {
        console.error("Ошибка при создании пользователя:", insertError)
        throw new Error(`Ошибка при создании пользователя: ${insertError.message}`)
      }

      result = newUser
      console.log("Новый пользователь создан:", result)

      // Создаем запись в mining_stats
      console.log("Создаем запись в mining_stats")
      const { error: statsError } = await supabase.from("mining_stats").insert([
        {
          user_id: result.id,
          total_mined: 0,
          mining_count: 0,
        },
      ])

      if (statsError) {
        console.error("Ошибка при создании mining_stats:", statsError)
        throw new Error(`Ошибка при создании mining_stats: ${statsError.message}`)
      }

      console.log("Mining stats успешно созданы")
    }

    console.log("=== Завершение createOrUpdateUser успешно ===")
    return result
  } catch (error) {
    console.error("=== Ошибка в createOrUpdateUser ===")
    console.error("Полная ошибка:", error)
    throw new Error(error.message || "Неизвестная ошибка при сохранении пользователя")
  }
}

// Обновляем хук useTelegramUser
import { useState, useEffect } from "react"

export function useTelegramUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const telegram = initTelegram()
    if (telegram) {
      const userData = getTelegramUser()
      if (userData) {
        setUser({
          id: userData.id,
          firstName: userData.first_name || "Неизвестно",
          lastName: userData.last_name || null,
          username: userData.username || null,
          photoUrl: userData.photo_url || null,
          displayName: userData.username
            ? `@${userData.username}`
            : userData.first_name
              ? `${userData.first_name}${userData.last_name ? ` ${userData.last_name}` : ""}`
              : "Неизвестный пользователь",
        })
      }
    }
  }, [])

  return (
    user || {
      id: null,
      firstName: "Неизвестно",
      username: null,
      photoUrl: null,
      displayName: "Неизвестный пользователь",
    }
  )
}

