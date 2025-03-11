"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MinersModal } from "../components/miners-modal"
import { BoostsModal } from "../components/boosts-modal"
import { PoolsModal } from "../components/pools-modal"

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

  // Блокировка только событий прокрутки, но не кликов
  useEffect(() => {
    // Функция для блокировки только событий прокрутки
    const blockScroll = (e) => {
      // Проверяем, является ли это событием прокрутки
      if (
        e.type === "wheel" ||
        e.type === "mousewheel" ||
        e.type === "DOMMouseScroll" ||
        (e.type === "touchmove" && e.touches.length > 0)
      ) {
        e.preventDefault()
        return false
      }
      // Для других событий не блокируем
      return true
    }

    // Список только событий прокрутки
    const scrollEvents = ["wheel", "mousewheel", "DOMMouseScroll", "touchmove"]

    // Добавляем обработчики только для событий прокрутки
    scrollEvents.forEach((event) => {
      document.addEventListener(event, blockScroll, { passive: false })
      window.addEventListener(event, blockScroll, { passive: false })
    })

    // Блокируем стандартное поведение прокрутки
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    // Добавляем CSS для предотвращения прокрутки, но разрешаем клики
    const style = document.createElement("style")
    style.innerHTML = `
      html, body {
        overflow: hidden !important;
        height: 100% !important;
        width: 100% !important;
        overscroll-behavior: none !important;
      }
    `
    document.head.appendChild(style)

    // Удаляем все обработчики при размонтировании
    return () => {
      scrollEvents.forEach((event) => {
        document.removeEventListener(event, blockScroll)
        window.removeEventListener(event, blockScroll)
      })
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.head.removeChild(style)
    }
  }, [])

  // Обработчик перехода в магазин
  const handleShopClick = () => {
    navigate("/shop")
  }

  // Обработчик выбора пула
  const handlePoolSelect = (pool) => {
    setMinerInfo((prev) => ({
      ...prev,
      pool: pool.name,
    }))
  }

  // Стили для квадратных кнопок
  const squareButtonStyle = {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    borderRadius: "12px",
    backgroundColor: "rgba(59, 130, 246, 0.8)",
    backdropFilter: "blur(4px)",
    color: "white",
    transition: "all 0.2s ease",
    cursor: "pointer",
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Фоновое изображение */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kandinsky-download-1741700347819-wTpegQamRbD36vdjw4hDDi5V3igvXt.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Оверлей для лучшей читаемости */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Верхний блок с балансом */}
        <div className="bg-[#242838]/80 backdrop-blur-sm p-3 rounded-lg mx-2 mt-2">
          <div className="text-center">
            <h2 className="font-bold text-blue-400">Баланс: {user?.balance || 0} 💎</h2>
            <p className="text-gray-300">Miner Pass: {user?.hasMinerPass ? "Активен ✨" : "Не активен"}</p>
          </div>
        </div>

        {/* Блок с информацией о майнинге */}
        <div className="bg-[#242838]/80 backdrop-blur-sm p-3 rounded-lg mx-2 mt-2">
          <div className="space-y-1 text-gray-300">
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

        {/* Основная область с кнопками и майнером */}
        <div className="flex-1 grid grid-cols-[60px_1fr_60px] gap-2 px-2 mt-2">
          {/* Левая колонка с кнопками */}
          <div className="flex flex-col items-center pt-4">
            <div className="space-y-4">
              <button
                style={squareButtonStyle}
                onClick={() => setShowMinersModal(true)}
                className="hover:bg-blue-600/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="2" x2="9" y2="4"></line>
                  <line x1="15" y1="2" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="22"></line>
                  <line x1="15" y1="20" x2="15" y2="22"></line>
                  <line x1="20" y1="9" x2="22" y2="9"></line>
                  <line x1="20" y1="14" x2="22" y2="14"></line>
                  <line x1="2" y1="9" x2="4" y2="9"></line>
                  <line x1="2" y1="14" x2="4" y2="14"></line>
                </svg>
              </button>

              <button
                style={squareButtonStyle}
                onClick={() => setShowBoostsModal(true)}
                className="hover:bg-blue-600/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </button>

              <button style={squareButtonStyle} className="hover:bg-blue-600/80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Центральная область с анимированным майнером и кнопкой майнинга */}
          <div className="flex flex-col">
            {/* Майнер */}
            <div className="aspect-square flex items-center justify-center bg-[#242838]/60 backdrop-blur-sm rounded-lg border border-blue-500/20 overflow-hidden mb-2">
              <div className="miner-animation">
                <style jsx>{`
                  .miner-animation {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  
                  .miner-animation:before {
                    content: '';
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: rgba(59, 130, 246, 0.8);
                    border-radius: 15px;
                    animation: pulse 2s infinite;
                  }
                  
                  .miner-animation:after {
                    content: '💎';
                    position: absolute;
                    font-size: 32px;
                    animation: float 3s ease-in-out infinite;
                  }
                  
                  @keyframes pulse {
                    0% {
                      transform: scale(0.95);
                      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                    }
                    
                    70% {
                      transform: scale(1);
                      box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
                    }
                    
                    100% {
                      transform: scale(0.95);
                      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                    }
                  }
                  
                  @keyframes float {
                    0% {
                      transform: translateY(0px);
                    }
                    50% {
                      transform: translateY(-20px);
                    }
                    100% {
                      transform: translateY(0px);
                    }
                  }
                `}</style>
              </div>
            </div>

            {/* Кнопка майнинга */}
            <button className="bg-[#3B82F6]/80 backdrop-blur-sm hover:bg-blue-600/80 text-white py-2 px-4 rounded-lg font-bold transition-colors cursor-pointer">
              Начать майнинг и таймер
            </button>
          </div>

          {/* Правая колонка с кнопками */}
          <div className="flex flex-col items-center pt-4">
            <div className="space-y-4">
              <button
                style={squareButtonStyle}
                onClick={() => setShowPoolsModal(true)}
                className="hover:bg-blue-600/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </button>

              <button style={squareButtonStyle} onClick={handleShopClick} className="hover:bg-blue-600/80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>

              <button style={squareButtonStyle} className="hover:bg-blue-600/80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showMinersModal && <MinersModal onClose={() => setShowMinersModal(false)} user={user} />}

      {showBoostsModal && <BoostsModal onClose={() => setShowBoostsModal(false)} user={user} />}

      {showPoolsModal && (
        <PoolsModal
          onClose={() => setShowPoolsModal(false)}
          user={user}
          currentPool={{ id: 1, name: minerInfo.pool }}
          onPoolSelect={handlePoolSelect}
        />
      )}
    </div>
  )
}

export default HomePage

