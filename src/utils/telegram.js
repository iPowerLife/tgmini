let tg = null

export function initTelegram() {
  try {
    if (window.Telegram?.WebApp) {
      tg = window.Telegram.WebApp
      tg.expand()
      tg.ready()
      return tg
    }
    return null
  } catch (error) {
    console.error("Error initializing Telegram:", error)
    return null
  }
}

export function useTelegramUser() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user || {
    id: 12345,
    username: "testuser",
    first_name: "Test",
  }

  return {
    id: user.id,
    firstName: user.first_name || "Unknown",
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
    photoUrl: user.photo_url,
    // Форматированное имя для отображения
    displayName: user.username
      ? `@${user.username}`
      : user.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Unknown User",
  }
}

