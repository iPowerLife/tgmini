let tg = null

export function initTelegram() {
  try {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      console.log("Telegram WebApp initialized:", tg)

      // Отключаем стандартные обработчики событий Telegram
      tg.disableClosingConfirmation()
      tg.expand() // Разворачиваем на весь экран

      // Сообщаем Telegram, что приложение готово
      tg.ready()
      return tg
    }

    console.log("No Telegram WebApp found, checking URL params...")
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")

    if (userId) {
      console.log("Using URL params for development:", { userId, username })
      return {
        initDataUnsafe: {
          user: {
            id: Number(userId),
            username: username || "dev_user",
            first_name: username || "Developer",
          },
        },
        ready: () => console.log("Mock ready called"),
        disableClosingConfirmation: () => console.log("Mock disableClosingConfirmation called"),
        expand: () => console.log("Mock expand called"),
      }
    }

    throw new Error("No Telegram WebApp and no URL params found")
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error)
    return null
  }
}

export function getTelegramUser() {
  try {
    // Пытаемся получить пользователя из Telegram WebApp
    const webAppUser = tg?.initDataUnsafe?.user
    if (webAppUser) {
      console.log("Got Telegram user:", webAppUser)
      return webAppUser
    }

    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userId")
    const username = urlParams.get("username")

    if (userId) {
      const user = {
        id: Number(userId),
        username: username || "dev_user",
        first_name: username || "Developer",
      }
      console.log("Using URL params user:", user)
      return user
    }

    throw new Error("No Telegram user or URL params found")
  } catch (error) {
    console.error("Error getting Telegram user:", error)
    return null
  }
}

