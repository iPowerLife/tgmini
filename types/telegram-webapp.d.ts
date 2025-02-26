interface TelegramWebApp {
  ready: () => void
  expand: () => void
  showAlert: (message: string) => void
  close: () => void
  // Add other methods as needed
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}

