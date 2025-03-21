let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Получаем все возможные данные
      console.log("WebApp version:", tg.version)
      console.log("WebApp platform:", tg.platform)
      console.log("InitData:", tg.initData)
      console.log("InitDataUnsafe:", tg.initDataUnsafe)

      // Настраиваем WebApp
      tg.expand()
      tg.ready()

      return tg
    }

    console.log("Telegram WebApp not found, using development mode")
    return null
  } catch (error) {
    console.error("Error initializing Telegram:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // Проверяем инициализацию Telegram
    if (!tg) {
      console.log("No Telegram instance, initializing...")
      tg = initTelegram()
    }

    // Пытаемся получить данные из Telegram WebApp
    if (window.Telegram?.WebApp) {
      const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user
      if (webAppUser?.id) {
        console.log("Got real Telegram user:", webAppUser)
        return {
          id: webAppUser.id,
          username: webAppUser.username,
          first_name: webAppUser.first_name,
          last_name: webAppUser.last_name,
          language_code: webAppUser.language_code,
          photo_url: webAppUser.photo_url,
        }
      }
    }

    // Пытаемся получить данные из URL параметров
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")
    const firstName = urlParams.get("first_name")
    const lastName = urlParams.get("last_name")

    if (userId) {
      const userData = {
        id: Number.parseInt(userId),
        username: username || null,
        first_name: firstName || null,
        last_name: lastName || null,
        language_code: "en",
        photo_url: null,
      }
      console.log("Got user data from URL params:", userData)
      return userData
    }

    // Если ничего не получилось, выбрасываем ошибку
    throw new Error("Could not get user data")
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    throw error
  }
}

import { supabase } from "../supabase"

export async function createOrUpdateUser(userData) {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: userData.id,
          username: userData.username,
          first_name: userData.first_name,
        },
        { onConflict: "telegram_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("Ошибка при создании/обновлении пользователя:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Ошибка при создании/обновлении пользователя:", error)
    return null
  }
}

// Экспортируем хук для получения данных пользователя
export function useTelegramUser() {
  const user = getTelegramUser()

  return {
    id: user?.id,
    firstName: user?.first_name || "Unknown",
    lastName: user?.last_name,
    username: user?.username,
    languageCode: user?.language_code,
    photoUrl: user?.photo_url,
    // Форматированное имя для отображения
    displayName: user?.username
      ? `@${user.username}`
      : user?.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Unknown User",
  }
}

