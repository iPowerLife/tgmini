export function TailwindTest() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-blue-500">Тест Tailwind CSS</h2>

      {/* Тест базовых утилит */}
      <div className="bg-red-500 hover:bg-red-600 p-4 rounded-lg">
        Если этот блок красный и становится темнее при наведении - базовые утилиты работают
      </div>

      {/* Тест градиентов */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-lg">
        Если этот блок имеет градиент - градиенты работают
      </div>

      {/* Тест анимации */}
      <div className="animate-pulse bg-green-500 p-4 rounded-lg">Если этот блок пульсирует - анимации работают</div>

      {/* Тест кастомных классов */}
      <div className="timer-container">
        <span className="timer-icon">⏳</span>
        <span className="timer-text">тест таймера</span>
        <span className="timer-value">12:34</span>
      </div>
    </div>
  )
}

