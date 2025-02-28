let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Получаем и проверяем initData
      const initData = tg.initData
      const initDataUnsafe = tg.initDataUnsafe
      console.log("Telegram WebApp data:", { initData, initDataUnsafe })

      // Проверяем данные пользователя
      const userData = initDataUnsafe?.user
      console.log("Telegram user data:", userData)

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    // Определяем режим разработки
    const isDev =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"

    if (isDev) {
      console.log("Development mode detected, using mock WebApp")
      return createDevModeWebApp()
    }

    throw new Error("This app must be opened in Telegram")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)

    // В режиме разработки возвращаем мок
    if (process.env.NODE_ENV === "development") {
      console.log("Falling back to development mode")
      return createDevModeWebApp()
    }

    throw error
  }
}

function createDevModeWebApp() {
  const mockTg = {
    initDataUnsafe: {
      user: {
        id: 12345,
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
    version: "dev",
    platform: "dev",
  }

  console.log("Created mock Telegram WebApp:", mockTg)
  tg = mockTg
  return mockTg
}

export function getTelegramUser() {
  try {
    if (!tg) {
      console.log("No Telegram instance, initializing...")
      tg = initTelegram()
    }

    const webAppUser = tg?.initDataUnsafe?.user
    if (!webAppUser?.id) {
      throw new Error("No valid user data found")
    }

    console.log("Got user data:", webAppUser)
    return webAppUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)

    // В режиме разработки возвращаем тестового пользователя
    if (process.env.NODE_ENV === "development") {
      const devUser = {
        id: 12345,
        username: "dev_user",
        first_name: "Developer",
      }
      console.log("Using development user:", devUser)
      return devUser
    }

    throw error
  }
}

