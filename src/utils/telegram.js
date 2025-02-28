// Инициализация Telegram WebApp
let tg = null

export function initTelegram() {
  console.log("📱 Initializing Telegram WebApp...")

  if (window.Telegram?.WebApp) {
    tg = window.Telegram.WebApp

    // Отключаем обработку событий, которые вызывают ошибки
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
    console.warn("⚠️ Telegram WebApp not available")
    return null
  }
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null
}

