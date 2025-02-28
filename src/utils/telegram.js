let tg = null

export function initTelegram() {
  try {
    // 1. Проверяем наличие Telegram WebApp
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Found Telegram WebApp:", tg)

      // 2. Получаем все возможные данные
      console.log("WebApp version:", tg.version)
      console.log("WebApp platform:", tg.platform)
      console.log("InitData:", tg.initData)
      console.log("InitDataUnsafe:", tg.initDataUnsafe)

      // 3. Настраиваем WebApp
      tg.expand()
      tg.ready()

      return tg
    }

    console.log("Telegram WebApp not found, using development mode")
    return null
  } catch (error) {
    console.error("Error initializing Telegram:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // 1. Проверяем инициализацию Telegram
    if (!tg) {
      console.log("No Telegram instance, initializing...")
      tg = initTelegram()
    }

    // 2. Пытаемся получить данные разными способами
    let userData = null

    // Способ 1: Через window.Telegram.WebApp напрямую
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      userData = window.Telegram.WebApp.initDataUnsafe.user
      console.log("Got user data from window.Telegram.WebApp:", userData)
    }
    // Способ 2: Через наш tg объект
    else if (tg?.initDataUnsafe?.user) {
      userData = tg.initDataUnsafe.user
      console.log("Got user data from tg object:", userData)
    }
    // Способ 3: Через параметры URL (для тестирования)
    else {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get("userId")
      const username = urlParams.get("username")

      if (userId) {
        userData = {
          id: Number.parseInt(userId),
          username: username || `user_${userId}`,
          first_name: username || `User ${userId}`,
        }
        console.log("Got user data from URL params:", userData)
      } else {
        // Создаем тестового пользователя для разработки
        const testUserId = Math.floor(Math.random() * 1000000) + 1
        userData = {
          id: testUserId,
          username: `dev_user_${testUserId}`,
          first_name: `Developer ${testUserId}`,
        }
        console.log("Created test user for development:", userData)
      }
    }

    // 3. Проверяем полученные данные
    if (!userData?.id) {
      throw new Error("No valid user data")
    }

    return userData
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    throw error
  }
}

