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

    // Определяем, находимся ли мы в режиме разработки
    const isDev =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"

    console.log("Development mode check:", isDev)

    // В режиме разработки возвращаем тестового пользователя
    if (isDev) {
      // Сначала проверяем URL параметры
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get("userId")
      const username = urlParams.get("username")

      const mockTg = {
        initDataUnsafe: {
          user: {
            id: userId ? Number(userId) : 12345,
            username: username || "dev_user",
            first_name: username || "Developer",
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

      console.log("Using mock Telegram WebApp:", mockTg)
      return mockTg
    }

    throw new Error("Application must be run in Telegram or development mode")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    // В случае ошибки возвращаем тестового пользователя
    return {
      initDataUnsafe: {
        user: {
          id: 12345,
          username: "error_user",
          first_name: "Error",
        },
      },
      ready: () => {},
      disableClosingConfirmation: () => {},
      expand: () => {},
    }
  }
}

export function getTelegramUser() {
  try {
    // Пытаемся получить пользователя из Telegram WebApp
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser) {
      console.log("Got Telegram user:", webAppUser)
      return webAppUser
    }

    // Определяем, находимся ли мы в режиме разработки
    const isDev =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"

    if (isDev) {
      // Проверяем URL параметры
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get("userId")
      const username = urlParams.get("username")

      const devUser = {
        id: userId ? Number(userId) : 12345,
        username: username || "dev_user",
        first_name: username || "Developer",
      }

      console.log("Using development user:", devUser)
      return devUser
    }

    // Если не в Telegram и не в режиме разработки, возвращаем тестового пользователя
    const fallbackUser = {
      id: 12345,
      username: "fallback_user",
      first_name: "Fallback",
    }

    console.log("Using fallback user:", fallbackUser)
    return fallbackUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // В случае ошибки возвращаем тестового пользователя
    return {
      id: 12345,
      username: "error_user",
      first_name: "Error",
    }
  }
}

