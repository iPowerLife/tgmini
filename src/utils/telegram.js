// Инициализация Telegram WebApp
export function initTelegram() {
  const tg = window.Telegram?.WebApp

  if (!tg) {
    console.error("Telegram WebApp is not available")
    return null
  }

  // Отключаем ненужные события
  const events = [
    "web_app_set_header_color",
    "web_app_set_bottom_bar_color",
    "web_app_request_theme",
    "web_app_request_viewport",
    "web_app_request_safe_area",
    "web_app_request_content_safe_area",
  ]

  events.forEach((event) => {
    tg.onEvent(event, () => {})
  })

  // Инициализируем WebApp
  tg.ready()
  tg.expand()

  return tg
}

// Получение данных пользователя
export function getTelegramUser() {
  const tg = window.Telegram?.WebApp

  if (!tg?.initDataUnsafe?.user) {
    console.error("No user data in Telegram WebApp")
    return null
  }

  return tg.initDataUnsafe.user
}

