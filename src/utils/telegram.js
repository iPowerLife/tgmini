// Функция для получения данных из URL
function getUrlParams() {
  const searchParams = new URLSearchParams(window.location.search)
  return {
    id: searchParams.get("id"),
    username: searchParams.get("username"),
    first_name: searchParams.get("first_name"),
  }
}

// Функция для сохранения данных пользователя
function saveUserData(data) {
  localStorage.setItem("telegram_user", JSON.stringify(data))
}

// Функция для получения сохраненных данных пользователя
function getSavedUserData() {
  const saved = localStorage.getItem("telegram_user")
  return saved ? JSON.parse(saved) : null
}

export function getTelegramUser() {
  // Сначала пробуем получить из WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user
    saveUserData(user)
    return user
  }

  // Затем пробуем получить из URL
  const urlParams = getUrlParams()
  if (urlParams.id) {
    const user = {
      id: Number.parseInt(urlParams.id),
      username: urlParams.username,
      first_name: urlParams.first_name,
    }
    saveUserData(user)
    return user
  }

  // Наконец, пробуем получить из localStorage
  const savedUser = getSavedUserData()
  if (savedUser) {
    return savedUser
  }

  return null
}

// Функция для создания пользователя в базе
export async function createOrUpdateUser(telegramUser) {
  if (!telegramUser?.id) {
    throw new Error("No valid user data")
  }

  const supabase = (await import("../supabase")).supabase

  // Проверяем существование пользователя
  const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

  if (existingUser) {
    // Обновляем существующего пользователя
    const { data, error } = await supabase
      .from("users")
      .update({
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramUser.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

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

  if (createError) throw createError

  // Создаем запись в mining_stats
  const { error: statsError } = await supabase.from("mining_stats").insert([
    {
      user_id: newUser.id,
      total_mined: 0,
      mining_count: 0,
    },
  ])

  if (statsError) throw statsError

  return newUser
}

