"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersModal({ onClose, user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [activeMiner, setActiveMiner] = useState(null)

  // Загрузка данных о майнерах пользователя и активном майнере
  useEffect(() => {
    const fetchMiners = async () => {
      try {
        setLoading(true)

        if (!user?.id) {
          setLoading(false)
          return
        }

        console.log("Загрузка майнеров для пользователя:", user.id)

        // Получаем майнеры пользователя из новой оптимизированной таблицы
        const { data, error } = await supabase.rpc("get_user_miners_with_models", {
          p_user_id: user.id,
        })

        if (error) {
          console.error("Ошибка при запросе майнеров:", error)
          throw error
        }

        console.log("Данные майнеров пользователя:", data)

        // Форматируем данные майнеров
        const formattedMiners = data
          ? data.map((item) => ({
              id: item.model_id, // Используем model_id как id
              modelId: item.model_id,
              level: item.level || 1,
              name: item.display_name || item.name || "Майнер",
              power: calculatePower(item.mining_power || 10, item.level || 1),
              energy: calculateEnergy(item.energy_consumption || 5, item.level || 1),
              image: item.image_url || "⚒️",
              rarity: getRarityFromPower(item.mining_power || 10),
              quantity: item.quantity || 1,
            }))
          : []

        console.log("Отформатированные майнеры:", formattedMiners)
        setMiners(formattedMiners)

        // Проверяем, есть ли активный майнер
        if (user.active_miner_id) {
          setActiveMiner(user.active_miner_id)

          // Также устанавливаем выбранный майнер как активный
          const active = formattedMiners.find((m) => m.id === user.active_miner_id)
          if (active) {
            setSelectedMiner(active)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке майнеров:", err)

        // Если произошла ошибка, используем тестовые данные
        const testMiners = [
          {
            id: 1,
            modelId: 1,
            name: "Базовый майнер",
            power: 10,
            level: 1,
            energy: 5,
            rarity: "common",
            quantity: 2,
          },
          {
            id: 2,
            modelId: 2,
            name: "Продвинутый майнер",
            power: 25,
            level: 2,
            energy: 12,
            rarity: "rare",
            quantity: 1,
          },
        ]

        setMiners(testMiners)
        setLoading(false)
      }
    }

    fetchMiners()
  }, [user])

  // Функция для определения редкости майнера по его мощности
  const getRarityFromPower = (power) => {
    if (power <= 15) return "common"
    if (power <= 30) return "rare"
    if (power <= 50) return "epic"
    return "legendary"
  }

  // Функция для расчета мощности майнера с учетом уровня
  const calculatePower = (basePower, level) => {
    return Math.round(basePower * (1 + (level - 1) * 0.15))
  }

  // Функция для расчета энергопотребления майнера с учетом уровня
  const calculateEnergy = (baseEnergy, level) => {
    return Math.round(baseEnergy * (1 + (level - 1) * 0.1))
  }

  // Функция для выбора майнера
  const handleSelectMiner = (miner) => {
    setSelectedMiner(miner)
  }

  // Функция для получения цвета в зависимости от редкости
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "blue"
      case "rare":
        return "purple"
      case "epic":
        return "orange"
      case "legendary":
        return "yellow"
      default:
        return "blue"
    }
  }

  // Обработчик события прокрутки для модального окна
  const handleModalScroll = (e) => {
    // Разрешаем прокрутку внутри модального окна
    e.stopPropagation()
  }

  // Функция для расчета общей мощности майнера с учетом количества
  const calculateTotalPower = (miner) => {
    return miner.power * miner.quantity
  }

  // Функция для расчета общего энергопотребления майнера с учетом количества
  const calculateTotalEnergy = (miner) => {
    return miner.energy * miner.quantity
  }

  // Функция для расчета дохода в час
  const calculateHourlyIncome = (miner) => {
    const totalPower = calculateTotalPower(miner)
    return Math.round(totalPower * 0.1 * 100) / 100
  }

  // Функция для расчета дохода за 24 часа
  const calculateDailyIncome = (miner) => {
    return Math.round(calculateHourlyIncome(miner) * 24 * 100) / 100
  }

  // Функция для активации майнера
  const handleActivateMiner = async (miner) => {
    try {
      if (!user?.id) return

      const { error } = await supabase.from("users").update({ active_miner_id: miner.id }).eq("id", user.id)

      if (error) {
        console.error("Ошибка при активации майнера:", error)
        return
      }

      setActiveMiner(miner.id)
      alert(`Майнер "${miner.name}" успешно активирован!`)
    } catch (err) {
      console.error("Ошибка при активации майнера:", err)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-[#242838]/95 backdrop-blur-sm p-4 rounded-lg w-[90%] max-w-md border border-blue-500/20 flex flex-col"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">Мои майнеры</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : miners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>У вас пока нет майнеров</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                onClose()
                window.location.href = "/shop"
              }}
            >
              Купить майнеры
            </button>
          </div>
        ) : (
          <div
            className="miners-list space-y-3 overflow-y-auto pr-1 custom-scrollbar"
            style={{
              overflowY: "auto",
              maxHeight: "calc(80vh - 100px)",
              WebkitOverflowScrolling: "touch",
            }}
            onWheel={handleModalScroll}
            onTouchMove={handleModalScroll}
          >
            {miners.map((miner) => (
              <div
                key={miner.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedMiner?.id === miner.id
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-[#1a1d2d] border-[#2a2f45] hover:border-blue-500/50"
                }`}
                onClick={() => handleSelectMiner(miner)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 bg-${getRarityColor(miner.rarity)}-500/20 rounded-lg flex items-center justify-center mr-3`}
                  >
                    {/* Иконка майнера */}
                    {typeof miner.image === "string" && miner.image.startsWith("http") ? (
                      <img
                        src={miner.image || "/placeholder.svg"}
                        alt={miner.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{miner.image || "⚒️"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-white">{miner.name}</h4>
                      <span className="text-xs text-blue-400">x{miner.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Мощность: <span className="text-blue-400">{calculateTotalPower(miner)} H/s</span>
                      </span>
                      <span className="text-gray-400">
                        Уровень: <span className="text-blue-400">{miner.level}</span>
                      </span>
                    </div>
                  </div>

                  {activeMiner === miner.id && (
                    <div className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Активен</div>
                  )}
                </div>

                {selectedMiner?.id === miner.id && (
                  <div className="mt-3 pt-3 border-t border-blue-500/30">
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>
                        Доход в час: <span className="text-blue-400">{calculateHourlyIncome(miner)} 💎</span>
                      </p>
                      <p>
                        Доход в сутки: <span className="text-blue-400">{calculateDailyIncome(miner)} 💎</span>
                      </p>
                      <p>
                        Энергопотребление: <span className="text-blue-400">{calculateTotalEnergy(miner)}/kWh</span>
                      </p>
                      <p>
                        Количество: <span className="text-blue-400">{miner.quantity} шт.</span>
                      </p>
                    </div>

                    {activeMiner !== miner.id && (
                      <button
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-lg text-sm transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateMiner(miner)
                        }}
                      >
                        Активировать
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <style jsx global>{`
.miners-list {
  -ms-overflow-style: none;  /* IE и Edge */
  scrollbar-width: none;     /* Firefox */
  overscroll-behavior: contain;
}

.miners-list::-webkit-scrollbar {
  display: none;  /* Chrome, Safari и Opera */
  width: 0;
  height: 0;
}
`}</style>
      </div>
    </div>
  )
}

