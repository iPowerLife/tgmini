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
  console.log("Начинаем создание/обновление пользователя:", userData)

  if (!userData) {
    console.error("userData is null")
    return null
  }

  // Проверяем наличие id
  if (!userData.id) {
    console.error("id не найден в данных пользователя:", userData)
    return null
  }

  try {
    const supabase = (await import("../supabase")).supabase

    // Сначала проверяем, существует ли пользователь
    console.log("Проверяем существующего пользователя...")
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", userData.id)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Ошибка при поиске пользователя:", selectError)
      throw selectError
    }

    let result

    if (existingUser) {
      console.log("Найден существующий пользователь:", existingUser)
      // Обновляем существующего пользователя
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          photo_url: userData.photo_url,
          last_seen: new Date().toISOString(),
        })
        .eq("telegram_id", userData.id)
        .select()
        .single()

      if (updateError) {
        console.error("Ошибка при обновлении пользователя:", updateError)
        throw updateError
      }

      result = data
    } else {
      console.log("Создаем нового пользователя...")
      // Создаем нового пользователя
      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
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
        ])
        .select()
        .single()

      if (insertError) {
        console.error("Ошибка при создании пользователя:", insertError)
        throw insertError
      }

      result = data

      // Создаем запись в mining_stats
      console.log("Создаем запись в mining_stats...")
      const { error: statsError } = await supabase.from("mining_stats").insert([
        {
          user_id: result.id,
          total_mined: 0,
          mining_count: 0,
        },
      ])

      if (statsError) {
        console.error("Ошибка при создании mining_stats:", statsError)
        throw statsError
      }
    }

    console.log("Пользователь успешно сохранен:", result)
    return result
  } catch (error) {
    console.error("Ошибка в createOrUpdateUser:", error)
    throw error
  }
}

export function useTelegramUser() {}

