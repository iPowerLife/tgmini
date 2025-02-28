export function initTelegram() {
  // Проверяем наличие Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp

    // Выводим все доступные данные для отладки
    console.log("Telegram WebApp:", {
      initData: tg.initData,
      initDataUnsafe: tg.initDataUnsafe,
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      themeParams: tg.themeParams,
      isExpanded: tg.isExpanded,
    })

    // Настраиваем WebApp
    tg.expand()
    tg.ready()

    return tg
  }
  return null
}

export function getTelegramUser() {
  // Простой способ получения данных пользователя
  const tg = window.Telegram?.WebApp

  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user
    console.log("Telegram user data:", user)
    return user
  }

  console.log("No Telegram user data found")
  return null
}

