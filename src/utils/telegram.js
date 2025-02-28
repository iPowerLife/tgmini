let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand()
      tg.ready()
      return tg
    }

    // В режиме разработки возвращаем мок
    console.log("Development mode, using mock WebApp")
    return createDevModeWebApp()
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    // В любом случае возвращаем мок для разработки
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
      // Возвращаем тестового пользователя вместо выброса ошибки
      return {
        id: 12345,
        username: "dev_user",
        first_name: "Developer",
      }
    }

    console.log("Got user data:", webAppUser)
    return webAppUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // Возвращаем тестового пользователя в случае ошибки
    return {
      id: 12345,
      username: "dev_user",
      first_name: "Developer",
    }
  }
}

