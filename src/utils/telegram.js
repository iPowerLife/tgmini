let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Проверяем данные пользователя
      const userData = tg.initDataUnsafe?.user
      console.log("Raw Telegram user data:", userData)

      if (!userData?.id) {
        throw new Error("Invalid Telegram user data")
      }

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    throw new Error("This app must be opened in Telegram")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    throw error // Пробрасываем ошибку дальше
  }
}

export function getTelegramUser() {
  if (!tg) {
    throw new Error("Telegram WebApp not initialized")
  }

  const user = tg.initDataUnsafe?.user
  if (!user?.id) {
    throw new Error("No valid Telegram user found")
  }

  console.log("Got real Telegram user:", user)
  return user
}

