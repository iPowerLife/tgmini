// Инициализация Telegram WebApp
export function initTelegram() {
  try {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.expand() // Раскрываем на весь экран
      tg.ready() // Сообщаем что приложение готово
      console.log("Telegram WebApp успешно инициализирован")
      return tg
    }
    console.warn("window.Telegram.WebApp не найден")
    return null
  } catch (error) {
    console.error("Ошибка при инициализации Telegram WebApp:", error)
    return null
  }
}

// Функция для получения тестового пользователя
function getTestUser() {
  return {
    id: 12345,
    first_name: "Тестовый",
    username: "testuser",
    photo_url: null,
  }
}

// Функция для сохранения данных пользователя
function saveUserData(data) {
  try {
    localStorage.setItem("telegram_user", JSON.stringify(data))
    console.log("Данные пользователя сохранены в localStorage")
  } catch (error) {
    console.error("Ошибка при сохранении данных пользователя:", error)
  }
}

// Функция для получения сохраненных данных пользователя
function getSavedUserData() {
  try {
    const saved = localStorage.getItem("telegram_user")
    if (saved) {
      console.log("Найдены сохраненные данные пользователя")
      return JSON.parse(saved)
    }
    return null
  } catch (error) {
    console.error("Ошибка при получении сохраненных данных:", error)
    return null
  }
}

// Основная функция получения данных пользователя
export function getTelegramUser() {
  console.log("Начинаем получение данных пользователя...")

  // 1. Пробуем получить из WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user
    console.log("Получены данные из Telegram WebApp:", user)
    saveUserData(user)
    return user
  }

  // 2. Пробуем получить из localStorage
  const savedUser = getSavedUserData()
  if (savedUser) {
    console.log("Используем сохраненные данные пользователя:", savedUser)
    return savedUser
  }

  // 3. Проверяем режим разработки
  if (process.env.NODE_ENV === "development") {
    console.log("Режим разработки - используем тестового пользователя")
    const testUser = getTestUser()
    saveUserData(testUser)
    return testUser
  }

  console.warn("Не удалось получить данные пользователя")
  return null
}

// Функция для создания или обновления пользователя в базе
export async function createOrUpdateUser(telegramUser) {
  if (!telegramUser?.id) {
    throw new Error("Некорректные данные пользователя")
  }

  console.log("Начинаем создание/обновление пользователя в базе:", telegramUser)

  const supabase = (await import("../supabase")).supabase

  try {
    // Проверяем существование пользователя
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Ошибка при поиске пользователя:", selectError)
      throw selectError
    }

    if (existingUser) {
      console.log("Найден существующий пользователь, обновляем данные")
      // Обновляем существующего пользователя
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Ошибка при обновлении пользователя:", updateError)
        throw updateError
      }

      console.log("Пользователь успешно обновлен:", data)
      return data
    }

    console.log("Создаем нового пользователя")
    // Создаем нового пользователя
    const { data: newUser, error: createError } = await supabase
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

    if (createError) {
      console.error("Ошибка при создании пользователя:", createError)
      throw createError
    }

    console.log("Создаем запись в mining_stats")
    // Создаем запись в mining_stats
    const { error: statsError } = await supabase.from("mining_stats").insert([
      {
        user_id: newUser.id,
        total_mined: 0,
        mining_count: 0,
      },
    ])

    if (statsError) {
      console.error("Ошибка при создании статистики:", statsError)
      throw statsError
    }

    console.log("Новый пользователь успешно создан:", newUser)
    return newUser
  } catch (error) {
    console.error("Ошибка при работе с базой данных:", error)
    throw new Error(`Ошибка при работе с базой данных: ${error.message}`)
  }
}

// Хук для получения данных пользователя
export function useTelegramUser() {
  const user = getTelegramUser()

  return {
    id: user?.id,
    firstName: user?.first_name || "Неизвестно",
    lastName: user?.last_name,
    username: user?.username,
    languageCode: user?.language_code,
    photoUrl: user?.photo_url,
    displayName: user?.username
      ? `@${user.username}`
      : user?.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Неизвестный пользователь",
  }
}

