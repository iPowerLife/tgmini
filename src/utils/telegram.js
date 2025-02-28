let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp

      // Получаем initData для проверки
      const initData = tg.initData
      const initDataUnsafe = tg.initDataUnsafe
      console.log("Telegram WebApp init data:", { initData, initDataUnsafe })

      // Проверяем данные пользователя
      const userData = initDataUnsafe?.user
      console.log("Telegram user data:", userData)

      if (!userData?.id) {
        console.warn("No valid user data in Telegram WebApp")
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
  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get("userId") || Math.floor(Math.random() * 1000000) + 1
  const username = urlParams.get("username") || `dev_user_${userId}`

  const mockTg = {
    initDataUnsafe: {
      user: {
        id: Number(userId),
        username: username,
        first_name: username,
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

    // Если нет пользователя в WebApp, генерируем случайного
    const userId = Math.floor(Math.random() * 1000000) + 1
    const username = `user_${userId}`

    const devUser = {
      id: userId,
      username: username,
      first_name: username,
    }

    console.log("Using generated user:", devUser)
    return devUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // В случае ошибки генерируем случайного пользователя
    const userId = Math.floor(Math.random() * 1000000) + 1
    const fallbackUser = {
      id: userId,
      username: `error_user_${userId}`,
      first_name: `Error User ${userId}`,
    }
    console.log("Using fallback user:", fallbackUser)
    return fallbackUser
  }
}

