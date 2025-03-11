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
      <div className="mb-4 bg-yellow-300 text-black p-4 rounded-lg">
        <div className="text-center">
          <h2 className="font-bold">Баланс: {user?.balance || 0} 💎</h2>
          <p>Miner Pass: {user?.hasMinerPass ? "Активен ✨" : "Не активен"}</p>
        </div>
      </div>

      {/* Блок с информацией о майнинге */}
      <div className="mb-4 bg-green-500 text-black p-4 rounded-lg">
        <div className="space-y-2">
          <p>Выбранный пул: {minerInfo.pool}</p>
          <p>Добыто: {minerInfo.totalMined.toFixed(2)} 💎</p>
          <p>Доход в час: {minerInfo.hourlyIncome.toFixed(2)} 💎</p>
          <div className="flex justify-between">
            <p>Хешрейт: {minerInfo.hashrate} H/s</p>
            <p>Энергия: {minerInfo.energy}/100</p>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Левая колонка с кнопками */}
        <div className="space-y-4">
          <button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg"
            onClick={() => setShowMinersModal(true)}
          >
            Майнеры
          </button>

          <button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg"
            onClick={() => setShowBoostsModal(true)}
          >
            Бусты
          </button>

          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg">Ещё</button>
        </div>

        {/* Центральная область */}
        <div className="aspect-square flex items-center justify-center bg-pink-500 rounded-lg">
          <div className="text-center p-4">
            <p>Здесь будет картинка майнера.</p>
            <p>можешь сюда пока что</p>
            <p>что хочешь</p>
            <p>поставить</p>
          </div>
        </div>

        {/* Правая колонка с кнопками */}
        <div className="space-y-4">
          <button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg"
            onClick={() => setShowPoolsModal(true)}
          >
            Пулы
          </button>

          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg" onClick={handleShopClick}>
            Магазин
          </button>

          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg">Настройки</button>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg font-bold">
        Начать майнинг и таймер
      </button>

      {/* Модальные окна */}
      {showMinersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242838] p-4 rounded-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Список майнеров</h3>
              <button onClick={() => setShowMinersModal(false)}>✕</button>
            </div>
            <div className="py-4">
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
              <h3 className="text-xl font-bold">Бусты</h3>
              <button onClick={() => setShowBoostsModal(false)}>✕</button>
            </div>
            <div className="py-4">
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
              <h3 className="text-xl font-bold">Майнинг пулы</h3>
              <button onClick={() => setShowPoolsModal(false)}>✕</button>
            </div>
            <div className="py-4">
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

