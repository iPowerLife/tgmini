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

    // Режим разработки - проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search)
    const devMode = urlParams.get("dev") === "true"

    if (devMode) {
      console.log("Development mode: using mock Telegram WebApp")
      return {
        initDataUnsafe: {
          user: {
            id: Number(urlParams.get("userId")) || 123456789,
            username: urlParams.get("username") || "dev_user",
            first_name: urlParams.get("firstName") || "Developer",
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
    }

    // Если не режим разработки и нет Telegram WebApp, выводим ошибку
    throw new Error("Telegram WebApp not found and not in development mode")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // Пытаемся получить пользователя из Telegram WebApp
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser) {
      return webAppUser
    }

    // Проверяем URL параметры для режима разработки
    const urlParams = new URLSearchParams(window.location.search)
    const devMode = urlParams.get("dev") === "true"

    if (devMode) {
      return {
        id: Number(urlParams.get("userId")) || 123456789,
        username: urlParams.get("username") || "dev_user",
        first_name: urlParams.get("firstName") || "Developer",
      }
    }

    // Если не режим разработки и нет пользователя, выводим ошибку
    throw new Error("No Telegram user found and not in development mode")
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return null
  }
}

