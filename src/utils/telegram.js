export function getTelegramUser() {
  const tg = window.Telegram?.WebApp

  console.log("Telegram WebApp:", {
    available: !!tg,
    initData: tg?.initData,
    initDataUnsafe: tg?.initDataUnsafe,
    user: tg?.initDataUnsafe?.user,
  })

  if (!tg) {
    console.error("Telegram WebApp is not available")
    return null
  }

  if (!tg.initDataUnsafe?.user) {
    console.error("No user data in Telegram WebApp")
    return null
  }

  return {
    id: tg.initDataUnsafe.user.id,
    username: tg.initDataUnsafe.user.username,
    firstName: tg.initDataUnsafe.user.first_name,
    lastName: tg.initDataUnsafe.user.last_name,
  }
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp
  if (tg) {
    console.log("Initializing Telegram WebApp...")
    tg.ready()
    tg.expand()
    return true
  }
  console.error("Failed to initialize Telegram WebApp")
  return false
}

