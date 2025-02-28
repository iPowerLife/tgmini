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

      if (userData?.id) {
        console.log("Valid Telegram user found:", userData)
      } else {
        console.log("No valid Telegram user, will use development mode")
        return createDevModeWebApp()
      }

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    // Если нет Telegram WebApp, используем режим разработки
    console.log("No Telegram WebApp found, using development mode")
    return createDevModeWebApp()
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return createDevModeWebApp()
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
  tg = mockTg // Устанавливаем глобальную переменную
  return mockTg
}

export function getTelegramUser() {
  try {
    if (!tg) {
      console.log("No Telegram instance, initializing...")
      tg = initTelegram()
    }

    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser?.id) {
      console.log("Got Telegram user:", webAppUser)
      return webAppUser
    }

    console.log("No valid user in Telegram WebApp, using development user")
    return {
      id: 12345,
      username: "dev_user",
      first_name: "Developer",
    }
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return {
      id: 12345,
      username: "dev_user",
      first_name: "Developer",
    }
  }
}

