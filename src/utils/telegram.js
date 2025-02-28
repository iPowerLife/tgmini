let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Telegram WebApp initialized:", tg)

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    // Режим разработки - возвращаем мок объект
    console.log("Development mode: using mock Telegram WebApp")
    return {
      initDataUnsafe: {
        user: {
          id: 123456789,
          username: "dev_user",
          first_name: "Developer",
        },
      },
      ready: () => console.log("Mock ready called"),
      disableClosingConfirmation: () => console.log("Mock disableClosingConfirmation called"),
      expand: () => console.log("Mock expand called"),
      MainButton: {
        show: () => console.log("Mock show called"),
        hide: () => console.log("Mock hide called"),
      },
    }
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser) {
      return webAppUser
    }

    // Проверяем URL параметры для режима разработки
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")

    if (userId) {
      return {
        id: Number.parseInt(userId),
        username: username || "user",
        first_name: username || "User",
      }
    }

    // Возвращаем тестового пользователя
    return {
      id: 123456789,
      username: "test_user",
      first_name: "Test",
    }
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return {
      id: 123456789,
      username: "test_user",
      first_name: "Test",
    }
  }
}

