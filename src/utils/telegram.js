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
    // В режиме разработки возвращаем мок
    return createDevModeWebApp()
  }
}

function createDevModeWebApp() {
  // Создаем уникальный ID для тестового пользователя
  const testUserId = Math.floor(Math.random() * 1000000) + 1

  const mockTg = {
    initDataUnsafe: {
      user: {
        id: testUserId,
        username: `dev_user_${testUserId}`,
        first_name: `Developer ${testUserId}`,
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

  console.log("Created mock Telegram WebApp with test user:", mockTg.initDataUnsafe.user)
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
      console.log("No valid user data, creating test user")
      // Создаем уникального тестового пользователя
      const testUserId = Math.floor(Math.random() * 1000000) + 1
      return {
        id: testUserId,
        username: `dev_user_${testUserId}`,
        first_name: `Developer ${testUserId}`,
      }
    }

    console.log("Got user data:", webAppUser)
    return webAppUser
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // Создаем уникального тестового пользователя в случае ошибки
    const testUserId = Math.floor(Math.random() * 1000000) + 1
    return {
      id: testUserId,
      username: `dev_user_${testUserId}`,
      first_name: `Developer ${testUserId}`,
    }
  }
}

