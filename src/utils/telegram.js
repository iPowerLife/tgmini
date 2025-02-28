let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // Получаем все возможные данные
      console.log("WebApp version:", tg.version)
      console.log("WebApp platform:", tg.platform)
      console.log("InitData:", tg.initData)
      console.log("InitDataUnsafe:", tg.initDataUnsafe)

      // Настраиваем WebApp
      tg.expand()
      tg.ready()

      return tg
    }

    console.log("Telegram WebApp not found, using development mode")
    // Возвращаем мок объекта Telegram для разработки
    return {
      initDataUnsafe: {
        user: {
          id: 12345,
          username: "testuser",
          first_name: "Test",
          last_name: "User",
        },
      },
    }
  } catch (error) {
    console.error("Error initializing Telegram:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // Проверяем инициализацию Telegram
    if (!tg) {
      console.log("No Telegram instance, initializing...")
      tg = initTelegram()
    }

    // Пытаемся получить данные из Telegram WebApp
    if (tg?.initDataUnsafe?.user) {
      const webAppUser = tg.initDataUnsafe.user
      console.log("Got real Telegram user:", webAppUser)
      return {
        id: webAppUser.id,
        username: webAppUser.username,
        first_name: webAppUser.first_name,
        last_name: webAppUser.last_name,
        language_code: webAppUser.language_code,
        photo_url: webAppUser.photo_url,
      }
    }

    // Если не получилось получить реального пользователя, возвращаем тестового
    console.log("Using test user data")
    return {
      id: 12345,
      username: "testuser",
      first_name: "Test",
      last_name: "User",
      language_code: "en",
      photo_url: null,
    }
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    // Возвращаем тестового пользователя в случае ошибки
    return {
      id: 12345,
      username: "testuser",
      first_name: "Test",
      last_name: "User",
      language_code: "en",
      photo_url: null,
    }
  }
}

