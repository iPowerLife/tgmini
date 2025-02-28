import { getTelegramUser } from "../utils/telegram"

export function useTelegramUser() {
  const user = getTelegramUser()

  return {
    id: user?.id,
    firstName: user?.first_name || "Unknown",
    lastName: user?.last_name,
    username: user?.username,
    languageCode: user?.language_code,
    photoUrl: user?.photo_url,
    // Форматированное имя для отображения
    displayName: user?.username
      ? `@${user.username}`
      : user?.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
        : "Unknown User",
  }
}

