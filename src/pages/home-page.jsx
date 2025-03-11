"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const HomePage = ({ user }) => {
  const [showMinersModal, setShowMinersModal] = useState(false)
  const [showBoostsModal, setShowBoostsModal] = useState(false)
  const [showPoolsModal, setShowPoolsModal] = useState(false)
  const [minerInfo, setMinerInfo] = useState({
    pool: "Стандартный",
    hashrate: 0,
    energy: 0,
    hourlyIncome: 0,
    totalMined: 0,
  })
  const navigate = useNavigate()

  // Загрузка данных пользователя
  useEffect(() => {
    if (user) {
      // Здесь можно загрузить данные о майнинге пользователя
      // и обновить состояние minerInfo
    }
  }, [user])

  // Обработчик перехода в магазин
  const handleShopClick = () => {
    navigate("/shop")
  }

  return (
    <div className="min-h-screen p-4 bg-[#121212] text-white">
      {/* Верхний блок с балансом */}
      <div className="mb-4 bg-[#242838] p-4 rounded-lg">
        <div className="text-center">
          <h2 className="font-bold text-blue-400">Баланс: {user?.balance || 0} 💎</h2>
          <p className="text-gray-300">Miner Pass: {user?.hasMinerPass ? "Активен ✨" : "Не активен"}</p>
        </div>
      </div>

      {/* Блок с информацией о майнинге */}
      <div className="mb-4 bg-[#242838] p-4 rounded-lg">
        <div className="space-y-2 text-gray-300">
          <p>
            Выбранный пул: <span className="text-blue-400">{minerInfo.pool}</span>
          </p>
          <p>
            Добыто: <span className="text-blue-400">{minerInfo.totalMined.toFixed(2)} 💎</span>
          </p>
          <p>
            Доход в час: <span className="text-blue-400">{minerInfo.hourlyIncome.toFixed(2)} 💎</span>
          </p>
          <div className="flex justify-between">
            <p>
              Хешрейт: <span className="text-blue-400">{minerInfo.hashrate} H/s</span>
            </p>
            <p>
              Энергия: <span className="text-blue-400">{minerInfo.energy}/100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Левая колонка с кнопками */}
        <div className="space-y-4">
          <button
            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
            onClick={() => setShowMinersModal(true)}
          >
            Майнеры
          </button>

          <button
            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
            onClick={() => setShowBoostsModal(true)}
          >
            Бусты
          </button>

          <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors">
            Ещё
          </button>
        </div>

        {/* Центральная область */}
        <div className="aspect-square flex items-center justify-center bg-[#242838] rounded-lg border border-blue-500/20">
          <div className="text-center p-4 text-gray-300">
            <p>Здесь будет картинка майнера.</p>
            <p>можешь сюда пока что</p>
            <p>что хочешь</p>
            <p>поставить</p>
          </div>
        </div>

        {/* Правая колонка с кнопками */}
        <div className="space-y-4">
          <button
            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
            onClick={() => setShowPoolsModal(true)}
          >
            Пулы
          </button>

          <button
            className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
            onClick={handleShopClick}
          >
            Магазин
          </button>

          <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-3 rounded-lg transition-colors">
            Настройки
          </button>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-4 rounded-lg font-bold transition-colors">
        Начать майнинг и таймер
      </button>

      {/* Модальные окна */}
      {showMinersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242838] p-4 rounded-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">Список майнеров</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowMinersModal(false)}>
                ✕
              </button>
            </div>
            <div className="py-4 text-gray-300">
              {/* Здесь будет список майнеров */}
              <p>Список майнеров будет здесь</p>
            </div>
          </div>
        </div>
      )}

      {showBoostsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242838] p-4 rounded-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">Бусты</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowBoostsModal(false)}>
                ✕
              </button>
            </div>
            <div className="py-4 text-gray-300">
              {/* Здесь будет список бустов */}
              <p>Список бустов будет здесь</p>
            </div>
          </div>
        </div>
      )}

      {showPoolsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242838] p-4 rounded-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">Майнинг пулы</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowPoolsModal(false)}>
                ✕
              </button>
            </div>
            <div className="py-4 text-gray-300">
              {/* Здесь будет список пулов */}
              <p>Список пулов будет здесь</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage

