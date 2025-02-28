let tg = null

export function initTelegram() {
  console.log("Initializing Telegram WebApp...")

  try {
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      tg.ready()
      console.log("Telegram WebApp initialized successfully")
      return tg
    }
  } catch (error) {
    console.warn("Failed to initialize Telegram WebApp:", error)
  }

  // Возвращаем мок для разработки
  return {
    initDataUnsafe: {
      user: {
        id: 12345,
        username: "test_user",
        first_name: "Test",
      },
    },
  }
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null
}

