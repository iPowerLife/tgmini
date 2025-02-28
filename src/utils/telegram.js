// Самая простая версия получения пользователя
export function getTelegramUser() {
  // В режиме разработки всегда возвращаем тестового пользователя
  if (!window.Telegram?.WebApp) {
    return {
      id: 12345,
      first_name: "Тестовый",
      username: "testuser",
      photo_url: null,
    }
  }

  // В продакшене берем данные только из WebApp
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (!user) {
    return null
  }

  return user
}

// Функция для создания/обновления пользователя в базе
export async function createOrUpdateUser(telegramUser) {
  if (!telegramUser?.id) {
    throw new Error("Нет данных пользователя")
  }

  const supabase = (await import("../supabase")).supabase

  // Сначала пробуем найти пользователя
  const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

  if (existingUser) {
    // Обновляем существующего пользователя
    const { data } = await supabase
      .from("users")
      .update({
        username: telegramUser.username,
        first_name: telegramUser.first_name,
      })
      .eq("telegram_id", telegramUser.id)
      .select()
      .single()

    return data
  }

  // Создаем нового пользователя
  const { data: newUser } = await supabase
    .from("users")
    .insert([
      {
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        balance: 0,
        mining_power: 1,
        level: 1,
        experience: 0,
        next_level_exp: 100,
      },
    ])
    .select()
    .single()

  // Создаем запись в mining_stats
  await supabase.from("mining_stats").insert([
    {
      user_id: newUser.id,
      total_mined: 0,
      mining_count: 0,
    },
  ])

  return newUser
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
    languageCode: user.language_code,
    photoUrl: user.photo_url,
    displayName: user.username
      ? `@${user.username}`
      : user.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Неизвестный пользователь",
  }
}

