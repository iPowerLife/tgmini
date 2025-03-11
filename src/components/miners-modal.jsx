"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersModal({ onClose, user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [activeMiner, setActiveMiner] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null) // Для отладки

  // Разрешаем прокрутку в модальном окне
  useEffect(() => {
    // Сохраняем оригинальные обработчики событий
    const originalHandlers = {}
    const events = ["wheel", "mousewheel", "DOMMouseScroll", "touchmove"]

    events.forEach((event) => {
      const originalHandler = document.addEventListener
      originalHandlers[event] = originalHandler

      // Переопределяем обработчик событий для модального окна
      document.addEventListener = (e, handler, options) => {
        if (e === event) {
          // Не добавляем обработчик для событий прокрутки
          return
        }
        return originalHandler.call(document, e, handler, options)
      }
    })

    // Восстанавливаем оригинальные обработчики при закрытии модального окна
    return () => {
      events.forEach((event) => {
        document.addEventListener = originalHandlers[event]
      })
    }
  }, [])

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

        // Получаем майнеры пользователя из таблицы user_miners с информацией из miner_models
        const { data: userMiners, error: minersError } = await supabase
          .from("user_miners")
          .select(`
    id,
    user_id,
    model_id,
    miner_models (
      id,
      name,
      display_name,
      mining_power,
      energy_consumption,
      image_url
    )
  `)
          .eq("user_id", user.id)

        if (minersError) {
          console.error("Ошибка при запросе user_miners:", minersError)
          throw minersError
        }

        console.log("Данные user_miners:", userMiners)

        // Для отладки: выводим все model_id
        if (userMiners && userMiners.length > 0) {
          console.log(
            "Все model_id:",
            userMiners.map((m) => m.model_id),
          )
        }

        // Подсчитываем количество майнеров каждой модели
        const modelCounts = {}
        if (userMiners && userMiners.length > 0) {
          userMiners.forEach((miner) => {
            const modelId = miner.model_id
            if (!modelCounts[modelId]) {
              modelCounts[modelId] = 0
            }
            modelCounts[modelId] += 1
          })
        }

        console.log("Количество майнеров по моделям:", modelCounts)
        setDebugInfo(modelCounts) // Сохраняем для отладки

        // Группируем майнеры по моделям для отображения
        const minersByModel = {}
        const uniqueMiners = []

        if (userMiners && userMiners.length > 0) {
          // Сначала группируем майнеры по model_id
          userMiners.forEach((miner) => {
            const modelId = miner.model_id
            if (!minersByModel[modelId]) {
              minersByModel[modelId] = {
                miners: [],
                modelData: miner.miner_models,
              }
            }
            minersByModel[modelId].miners.push(miner)
          })

          // Затем создаем один элемент для каждой модели с правильным количеством
          Object.keys(minersByModel).forEach((modelId) => {
            const modelGroup = minersByModel[modelId]
            const count = modelGroup.miners.length
            const firstMiner = modelGroup.miners[0]
            const modelData = modelGroup.modelData

            uniqueMiners.push({
              id: firstMiner.id, // Используем ID первого май��ера этой модели
              modelId: Number.parseInt(modelId),
              level: 1, // Default level since the column doesn't exist
              name: modelData?.display_name || "Майнер",
              power: calculatePower(modelData?.mining_power || 10, 1),
              energy: calculateEnergy(modelData?.energy_consumption || 5, 1),
              image: modelData?.image_url || "⚒️",
              rarity: getRarityFromPower(modelData?.mining_power || 10),
              count: count, // Устанавливаем правильное количество
            })
          })
        }

        console.log("Уникальные майнеры с количеством:", uniqueMiners)
        setMiners(uniqueMiners)

        // Проверяем, есть ли активный майнер
        if (user.active_miner_id) {
          setActiveMiner(user.active_miner_id)

          // Также устанавливаем выбранный майнер как активный
          const activeMinerData = userMiners.find((m) => m.id === user.active_miner_id)
          if (activeMinerData) {
            const activeModelId = activeMinerData.model_id
            const active = uniqueMiners.find((m) => m.modelId === activeModelId)
            if (active) {
              setSelectedMiner(active)
            }
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
            count: 2, // Тестовое количество
          },
          {
            id: 2,
            modelId: 2,
            name: "Продвинутый майнер",
            power: 25,
            level: 2,
            energy: 12,
            rarity: "rare",
            count: 1, // Тестовое количество
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

  // Функция для активации майнера
  const activateMiner = async (minerId) => {
    try {
      console.log("Активация майнера:", minerId)

      // Обновляем активный майнер в базе данных
      const { error } = await supabase.from("users").update({ active_miner_id: minerId }).eq("id", user.id)

      if (error) {
        console.error("Ошибка при обновлении active_miner_id:", error)
        throw error
      }

      // Обновляем состояние
      setActiveMiner(minerId)

      // Показываем уведомление об успехе
      alert("Майнер успешно активирован!")
    } catch (error) {
      console.error("Ошибка при активации майнера:", error)
      alert("Не удалось активировать майнер")
    }
  }

  const upgradeMiner = async (minerId) => {
    try {
      console.log("Улучшение майнера:", minerId)

      // Получаем текущий майнер
      const miner = miners.find((m) => m.id === minerId)
      if (!miner) return

      // Рассчитываем стоимость улучшения
      const upgradeCost = Math.round(100 * Math.pow(1.5, miner.level - 1))

      // Проверяем, достаточно ли у пользователя средств
      if (user.balance < upgradeCost) {
        alert(`Недостаточно средств! Требуется ${upgradeCost} 💎`)
        return
      }

      // Списываем средства с баланса пользователя
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: user.balance - upgradeCost })
        .eq("id", user.id)

      if (balanceError) {
        console.error("Ошибка при обновлении баланса:", balanceError)
        throw balanceError
      }

      // Обновляем локальное состояние майнера
      setMiners(
        miners.map((m) => {
          if (m.id === minerId) {
            const newLevel = m.level + 1
            return {
              ...m,
              level: newLevel,
              power: calculatePower(m.power / calculatePower(1, m.level), newLevel),
              energy: calculateEnergy(m.energy / calculateEnergy(1, m.level), newLevel),
            }
          }
          return m
        }),
      )

      // Показываем уведомление об успехе
      alert(`Майнер улучшен до уровня ${miner.level + 1}!`)
    } catch (error) {
      console.error("Ошибка при улучшении майнера:", error)
      alert("Не удалось улучшить майнер")
    }
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

        {/* Отладочная информация */}
        {debugInfo && (
          <div className="mb-2 p-2 bg-gray-800 rounded text-xs text-gray-300">
            <p>Отладка - количество майнеров по моделям:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

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
                    className={`w-12 h-12 bg-${getRarityColor(miner.rarity)}-500/20 rounded-lg flex items-center justify-center mr-3 relative`}
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

                    {/* Бейдж с количеством */}
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {miner.count}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-white">{miner.name}</h4>
                      {/* Отображаем количество майнеров */}
                      <span className="text-xs text-blue-400">x{miner.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Мощность: <span className="text-blue-400">{miner.power} H/s</span>
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
                        Доход: <span className="text-blue-400">{Math.round(miner.power * 0.1 * 100) / 100} 💎/час</span>
                      </p>
                      <p>
                        Энергопотребление: <span className="text-blue-400">{miner.energy}/час</span>
                      </p>
                      <p>
                        Стоимость улучшения:{" "}
                        <span className="text-blue-400">{Math.round(100 * Math.pow(1.5, miner.level - 1))} 💎</span>
                      </p>
                      <p>
                        Количество: <span className="text-blue-400">{miner.count} шт.</span>
                      </p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        className={`flex-1 ${
                          activeMiner === miner.id ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        } text-white py-1.5 px-3 rounded-lg text-sm transition-colors`}
                        onClick={() => activeMiner !== miner.id && activateMiner(miner.id)}
                        disabled={activeMiner === miner.id}
                      >
                        {activeMiner === miner.id ? "Активирован" : "Активировать"}
                      </button>
                      <button
                        className="bg-[#2a2f45] hover:bg-[#353b58] text-gray-300 py-1.5 px-3 rounded-lg text-sm transition-colors"
                        onClick={() => upgradeMiner(miner.id)}
                      >
                        Улучшить
                      </button>
                    </div>
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

