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

  // Стили для квадратных кнопок
  const squareButtonStyle = {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    borderRadius: "12px",
    backgroundColor: "#3B82F6",
    color: "white",
    transition: "all 0.2s ease",
  }

  return (
    <div className="min-h-screen bg-[#0F1729] text-white">
      {/* Верхний блок с информацией */}
      <div className="p-4 bg-[#1C2538] rounded-lg m-4">
        <div className="space-y-2">
          <p className="text-gray-400">
            Выбранный пул: <span className="text-white">{minerInfo.pool}</span>
          </p>
          <p className="text-gray-400">
            Добыто: <span className="text-white">0.00 💎</span>
          </p>
          <p className="text-gray-400">
            Доход в час: <span className="text-white">0.00 💎</span>
          </p>
          <div className="flex justify-between text-gray-400">
            <p>
              Хешрейт: <span className="text-white">0 H/s</span>
            </p>
            <p>
              Энергия: <span className="text-white">0/100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-3 gap-4 px-4">
        {/* Левая колонка с кнопками */}
        <div className="space-y-4 flex flex-col items-center">
          <button style={squareButtonStyle} onClick={() => setShowMinersModal(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button style={squareButtonStyle} onClick={() => setShowBoostsModal(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z" />
            </svg>
          </button>

          <button style={squareButtonStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Центральная область */}
        <div className="aspect-square flex items-center justify-center bg-[#1C2538] rounded-lg">
          <div className="w-16 h-16">
            <svg viewBox="0 0 24 24" fill="#3B82F6" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 19h20L12 2zm0 4l6.5 11h-13L12 6z" />
            </svg>
          </div>
        </div>

        {/* Правая колонка с кнопками */}
        <div className="space-y-4 flex flex-col items-center">
          <button style={squareButtonStyle} onClick={() => setShowPoolsModal(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </button>

          <button style={squareButtonStyle} onClick={handleShopClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>

          <button style={squareButtonStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <div className="px-4 mt-4">
        <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white p-4 rounded-lg font-medium">
          Начать майнинг и таймер
        </button>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C2538] p-4">
        <div className="flex justify-between max-w-md mx-auto">
          <button className="text-blue-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20v-6M6 20V10M18 20V4" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19c0-2 1-3 2.5-3h5c1.5 0 2.5 1 2.5 3v1.662" />
            </svg>
          </button>
        </div>
      </div>

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

