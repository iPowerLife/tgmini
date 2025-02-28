let tg = null

export function initTelegram(retries = 3) {
  console.log("📱 Initializing Telegram WebApp...")

  for (let i = 0; i < retries; i++) {
    try {
      if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp

        // Отключаем обработку проблемных событий
        const events = [
          "web_app_request_viewport",
          "web_app_request_theme",
          "web_app_request_background",
          "web_app_set_background_color",
        ]

        events.forEach((event) => {
          tg.onEvent(event, () => {})
        })

        tg.ready()
        console.log("✅ Telegram WebApp initialized")
        return tg
      } else {
        throw new Error("Telegram WebApp not available")
      }
    } catch (error) {
      console.warn(`⚠️ Initialization attempt ${i + 1}/${retries} failed:`, error.message)
      if (i < retries - 1) {
        // Ждем перед следующей попыткой
        new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  console.warn("⚠️ Failed to initialize Telegram WebApp, continuing in dev mode")
  return null
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null
}

