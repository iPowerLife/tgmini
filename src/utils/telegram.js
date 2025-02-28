let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp

      // Получаем и проверяем initData
      const initData = tg.initData
      const initDataUnsafe = tg.initDataUnsafe
      console.log("Raw Telegram initData:", initData)
      console.log("Raw Telegram initDataUnsafe:", initDataUnsafe)

      // Проверяем данные пользователя
      const userData = initDataUnsafe?.user
      if (!userData?.id) {
        throw new Error("No valid user data in Telegram WebApp")
      }

      console.log("Valid Telegram user data:", userData)

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    throw new Error("No Telegram WebApp found")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // Проверяем наличие Telegram WebApp
    if (!window.Telegram?.WebApp) {
      throw new Error("No Telegram WebApp found")
    }

    // Получаем данные пользователя
    const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user
    if (!webAppUser?.id) {
      throw new Error("No valid user data in Telegram WebApp")
    }

    // Проверяем обязательные поля
    if (typeof webAppUser.id !== "number") {
      throw new Error("Invalid user ID type")
    }

    console.log("Validated Telegram user:", webAppUser)
    return webAppUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return null
  }
}

