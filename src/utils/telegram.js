export function getTelegramUser() {
  const tg = window.Telegram?.WebApp
  if (!tg) {
    console.error("Telegram WebApp is not available")
    return null
  }

  return {
    id: tg.initDataUnsafe?.user?.id,
    username: tg.initDataUnsafe?.user?.username,
    firstName: tg.initDataUnsafe?.user?.first_name,
    lastName: tg.initDataUnsafe?.user?.last_name,
  }
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp
  if (tg) {
    tg.ready()
    tg.expand()
  }
}

