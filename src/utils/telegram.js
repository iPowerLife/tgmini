let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      const userData = tg.initDataUnsafe?.user
      console.log("Telegram WebApp initialized with user data:", userData)

      if (!userData?.id) {
        console.warn("Invalid Telegram user data:", userData)
        return createDevModeWebApp()
      }

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    console.log("No Telegram WebApp found, using development mode")
    return createDevModeWebApp()
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return createDevModeWebApp()
  }
}

function createDevModeWebApp() {
  // Определяем, находимся ли мы в режиме разработки
  const isDev =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"

  // Получаем параметры из URL
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
    version: "dev",
    platform: "dev",
  }

  console.log("Created mock Telegram WebApp:", mockTg)
  return mockTg
}

export function getTelegramUser() {
  try {
    // Пытаемся получить пользователя из Telegram WebApp
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser?.id) {
      console.log("Got real Telegram user:", webAppUser)
      return webAppUser
    }

    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")

    // Создаем тестового пользователя
    const devUser = {
      id: userId ? Number(userId) : 12345,
      username: username || "dev_user",
      first_name: username || "Developer",
    }

    console.log("Using development user:", devUser)
    return devUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return null
  }
}

