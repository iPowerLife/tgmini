// Инициализация Telegram WebApp с retry логикой
export async function initTelegram(maxRetries = 3) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      // Ждем загрузки скрипта Telegram WebApp
      if (!window.Telegram?.WebApp) {
        throw new Error("Telegram WebApp not loaded")
      }

      const tg = window.Telegram.WebApp

      // Отключаем ненужные события
      const events = [
        "web_app_set_header_color",
        "web_app_set_background_color",
        "web_app_set_bottom_bar_color",
        "web_app_request_theme",
        "web_app_request_viewport",
      ]

      events.forEach((event) => {
        tg.onEvent(event, () => {})
      })

      // Инициализируем WebApp
      tg.ready()
      tg.expand()

      console.log("✅ Telegram WebApp initialized successfully")
      return tg
    } catch (error) {
      console.error(`❌ Attempt ${retries + 1}/${maxRetries} failed:`, error.message)
      retries++

      if (retries === maxRetries) {
        console.error("🚫 Failed to initialize Telegram WebApp")
        return null
      }

      // Ждем перед следующей попыткой
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
    }
  }

  return null
}

// Получение данных пользователя с проверками
export function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp

    if (!tg) {
      throw new Error("Telegram WebApp not available")
    }

    const user = tg.initDataUnsafe?.user

    if (!user) {
      throw new Error("No user data in Telegram WebApp")
    }

    console.log("✅ Telegram user data retrieved:", user)
    return user
  } catch (error) {
    console.error("❌ Error getting Telegram user:", error.message)
    return null
  }
}

