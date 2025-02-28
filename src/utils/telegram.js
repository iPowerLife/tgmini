export function initTelegram() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    tg.expand()
    tg.ready()
    return tg
  }
  return null
}

export function getTelegramUser() {
  // Способ 1: Через window.Telegram.WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user
    console.log("Method 1 - WebApp user:", user)
    return user
  }

  // Способ 2: Через window.Telegram.WebView
  if (window.Telegram?.WebView?.initParams) {
    try {
      const params = JSON.parse(window.Telegram.WebView.initParams)
      if (params.user) {
        console.log("Method 2 - WebView user:", params.user)
        return params.user
      }
    } catch (e) {
      console.error("Error parsing WebView params:", e)
    }
  }

  // Способ 3: Через хэш в URL
  try {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const params = new URLSearchParams(hash)
      const tgData = params.get("tgWebAppData")
      if (tgData) {
        const data = JSON.parse(decodeURIComponent(tgData))
        if (data.user) {
          console.log("Method 3 - URL hash user:", data.user)
          return data.user
        }
      }
    }
  } catch (e) {
    console.error("Error parsing URL hash:", e)
  }

  // Способ 4: Через URL параметры
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get("userId") || urlParams.get("id")
  const username = urlParams.get("username")
  const firstName = urlParams.get("first_name")

  if (userId) {
    const user = {
      id: Number.parseInt(userId),
      username: username || null,
      first_name: firstName || username || "User",
    }
    console.log("Method 4 - URL params user:", user)
    return user
  }

  // Способ 5: Через localStorage (если данные были сохранены ранее)
  const savedUser = localStorage.getItem("tg_user")
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser)
      console.log("Method 5 - localStorage user:", user)
      return user
    } catch (e) {
      console.error("Error parsing localStorage user:", e)
    }
  }

  console.warn("No user data found through any method")
  return null
}

// Функция для сохранения пользователя в localStorage
export function saveTelegramUser(user) {
  if (user) {
    localStorage.setItem("tg_user", JSON.stringify(user))
  }
}

