"use client"
import { useNavigate } from "react-router-dom"

const HomePage = ({ user }) => {
  const navigate = useNavigate()

  // Стили для квадратных кнопок
  const buttonStyle = {
    width: "56px",
    height: "56px",
    backgroundColor: "#3B82F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <div className="min-h-screen bg-[#0F1729] text-white">
      {/* Верхний блок с информацией */}
      <div className="p-4 bg-[#1C2538] mx-4 mt-4 rounded-lg">
        <div className="space-y-2">
          <div className="text-gray-400">
            Выбранный пул: <span className="text-white">Стандартный</span>
          </div>
          <div className="text-gray-400">
            Добыто: <span className="text-white">0.00 💎</span>
          </div>
          <div className="text-gray-400">
            Доход в час: <span className="text-white">0.00 💎</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <div>
              Хешрейт: <span className="text-white">0 H/s</span>
            </div>
            <div>
              Энергия: <span className="text-white">0/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-3 gap-4 px-4 mt-4">
        {/* Левая колонка */}
        <div className="space-y-4">
          <button style={buttonStyle}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button style={buttonStyle}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z" />
            </svg>
          </button>

          <button style={buttonStyle}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Центральная область */}
        <div className="aspect-square bg-[#1C2538] rounded-lg flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#3B82F6">
            <path d="M12 2L2 20h20L12 2z" />
          </svg>
        </div>

        {/* Правая колонка */}
        <div className="space-y-4">
          <button style={buttonStyle}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </button>

          <button style={buttonStyle} onClick={() => navigate("/shop")}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>

          <button style={buttonStyle}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <div className="px-4 mt-4">
        <button className="w-full bg-[#3B82F6] text-white py-4 rounded-lg">Начать майнинг и таймер</button>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C2538] p-4">
        <div className="flex justify-between max-w-md mx-auto">
          <button className="text-[#3B82F6]">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20v-6M6 20V10M18 20V4" />
            </svg>
          </button>
          <button className="text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19c0-2 1-3 2.5-3h5c1.5 0 2.5 1 2.5 3v1.662" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage

