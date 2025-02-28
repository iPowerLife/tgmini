// Функция для инициализации Telegram WebApp
export function initTelegram() {
  const telegram = window.Telegram?.WebApp

  if (telegram) {
    telegram.ready()
    return telegram
  }

  return null
}

// Функция для получения данных пользователя
export function getTelegramUser() {
  const telegram = window.Telegram?.WebApp

  if (!telegram) {
    if (process.env.NODE_ENV === "development") {
      return {
        id: 12345,
        first_name: "Тестовый",
        username: "testuser",
        photo_url: null,
        initData: "test_data",
      }
    }
    return null
  }

  const initDataUnsafe = telegram.initDataUnsafe || {}
  const initData = telegram.initData || ""

  if (!initDataUnsafe.user) {
    return null
  }

  return {
    id: initDataUnsafe.user.id,
    username: initDataUnsafe.user.username || null,
    first_name: initDataUnsafe.user.first_name,
    last_name: initDataUnsafe.user.last_name || null,
    photo_url: initDataUnsafe.user.photo_url || null,
    initData: initData,
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
          balance: 0,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "telegram_id",
          ignoreDuplicates: false,
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

// Хук для получения данных пользователя
export function useTelegramUser() {
  const user = getTelegramUser()

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

