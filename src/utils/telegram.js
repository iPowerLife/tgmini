let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
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

    // 2. Пытаемся получить данные из Telegram WebApp
    if (window.Telegram?.WebApp) {
      const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user
      if (webAppUser?.id) {
        console.log("Got real Telegram user:", webAppUser)
        return webAppUser
      }
    }

    // 3. Пытаемся получить данные из URL параметров
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")
    const firstName = urlParams.get("first_name")

    if (userId) {
      const userData = {
        id: Number.parseInt(userId),
        username: username || null,
        first_name: firstName || null,
      }
      console.log("Got user data from URL params:", userData)
      return userData
    }

    // 4. Если ничего не получилось, выбрасываем ошибку
    throw new Error("Could not get user data")
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    throw error
  }
}

