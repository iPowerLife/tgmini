export function BottomMenu() {
  const tg = window?.Telegram?.WebApp || window.TelegramWebApp

  const handleClick = (command) => {
    if (tg) {
      tg.sendData(JSON.stringify({ command: command }))
      // Добавляем вибрацию при клике для обратной связи
      tg.HapticFeedback.impactOccurred("light")
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => handleClick("home")}
          className="flex flex-col items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xs text-gray-400">Главная</span>
        </button>

        <button
          onClick={() => handleClick("shop")}
          className="flex flex-col items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-xs text-gray-400">Магазин</span>
        </button>

        <button
          onClick={() => handleClick("tasks")}
          className="flex flex-col items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span className="text-xs text-gray-400">Задания</span>
        </button>

        <button
          onClick={() => handleClick("rating")}
          className="flex flex-col items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5h3.5L12 7l4-3h3.5a2.5 2.5 0 0 1 0 5H18" />
            <path d="M6 9v12" />
            <path d="M18 9v12" />
            <path d="M12 7v14" />
          </svg>
          <span className="text-xs text-gray-400">Рейтинг</span>
        </button>

        <button
          onClick={() => handleClick("profile")}
          className="flex flex-col items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-xs text-gray-400">Профиль</span>
        </button>
      </div>
    </div>
  )
}

