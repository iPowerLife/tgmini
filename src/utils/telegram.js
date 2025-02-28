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

    console.log("Telegram WebApp not found")
    return null
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
    if (window.Telegram?.WebApp) {
      const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user
      if (webAppUser) {
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
    }

    // Пытаемся получить данные из URL параметров
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")
    const firstName = urlParams.get("first_name")
    const lastName = urlParams.get("last_name")

    if (userId) {
      const userData = {
        id: Number.parseInt(userId),
        username: username || null,
        first_name: firstName || null,
        last_name: lastName || null,
        language_code: "en",
        photo_url: null,
      }
      console.log("Got user data from URL params:", userData)
      return userData
    }

    // Если ничего не получилось, выбрасываем ошибку
    throw new Error("Could not get user data")
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    throw error // Пробрасываем ошибку дальше, чтобы App мог её обработать
  }
}

