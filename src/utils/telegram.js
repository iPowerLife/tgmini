let tg = null

export function initTelegram() {
  console.log("Initializing Telegram WebApp...")

  try {
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Отключаем проблемные обработчики событий
      const events = ["viewportChanged", "themeChanged"]
      events.forEach((event) => {
        try {
          tg.onEvent(event, () => {})
        } catch (e) {
          console.warn(`Failed to set ${event} handler:`, e)
        }
      })

      try {
        tg.ready()
        console.log("Telegram WebApp initialized successfully")
      } catch (e) {
        console.warn("Error in tg.ready():", e)
      }

      return tg
    } else {
      console.log("Telegram WebApp not found, using development mode")
    }
  } catch (error) {
    console.warn("Error initializing Telegram WebApp:", error)
  }

  // Возвращаем мок для разработки
  console.log("Using development mock")
  return {
    initDataUnsafe: {
      user: {
        id: 12345,
        username: "dev_user",
        first_name: "Developer",
      },
    },
  }
}

export function getTelegramUser() {
  try {
    // Пробуем получить пользователя из WebApp
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser) {
      console.log("Got Telegram user from WebApp:", webAppUser)
      return webAppUser
    }

    // Если не получилось, проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")
    if (userId) {
      console.log("Got user from URL params:", { userId, username })
      return {
        id: Number.parseInt(userId),
        username: username || "user",
        first_name: username || "User",
      }
    }

    // Если и это не сработало, возвращаем тестового пользователя
    console.log("Using test user")
    return {
      id: 12345,
      username: "test_user",
      first_name: "Test",
    }
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // В случае ошибки тоже возвращаем тестового пользователя
    return {
      id: 12345,
      username: "test_user",
      first_name: "Test",
    }
  }
}

