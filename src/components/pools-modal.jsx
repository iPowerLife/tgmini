"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function PoolsModal({ onClose, user, currentPool, onPoolSelect }) {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPoolId, setSelectedPoolId] = useState(null)

  // Загрузка данных о пулах
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true)

        console.log("Загрузка пулов...")

        // Получаем доступные пулы из таблицы mining_pools
        const { data, error } = await supabase
          .from("mining_pools")
          .select("*")
          .order("fee_percent", { ascending: true })

        if (error) {
          console.error("Ошибка при запросе mining_pools:", error)
          throw error
        }

        console.log("Данные mining_pools:", data)

        // Форматируем данные пулов
        const formattedPools = data
          ? data.map((pool) => ({
              id: pool.id,
              name: pool.display_name || pool.name,
              description: pool.description || "Майнинг пул",
              difficulty: pool.min_miners || 1,
              reward_multiplier: pool.multiplier || 1,
              stability: 100 - (pool.fee_percent || 0),
              fee: pool.fee_percent || 0,
            }))
          : []

        setPools(formattedPools)

        // Устанавливаем текущий выбранный пул
        if (currentPool?.id) {
          setSelectedPoolId(currentPool.id)
        } else if (formattedPools.length > 0) {
          // Если текущий пул не указан, выбираем первый из списка
          setSelectedPoolId(formattedPools[0].id)
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке пулов:", err)

        // Если произошла ошибка, используем тестовые данные
        const testPools = [
          {
            id: 1,
            name: "Стандартный пул",
            description: "Базовый майнинг пул для начинающих",
            difficulty: 1,
            reward_multiplier: 1,
            stability: 100,
            fee: 0,
          },
          {
            id: 2,
            name: "Продвинутый пул",
            description: "Повышенная сложность, высокая награда",
            difficulty: 2,
            reward_multiplier: 2.5,
            stability: 90,
            fee: 5,
          },
          {
            id: 3,
            name: "Экспертный пул",
            description: "Максимальная сложность и награда",
            difficulty: 3,
            reward_multiplier: 4,
            stability: 80,
            fee: 10,
          },
        ]

        setPools(testPools)

        // Устанавливаем текущий выбранный пул
        if (currentPool?.id) {
          setSelectedPoolId(currentPool.id)
        } else {
          // Если текущий пул не указан, выбираем первый из списка
          setSelectedPoolId(testPools[0].id)
        }

        setLoading(false)
      }
    }

    fetchPools()
  }, [currentPool])

  // Функция для выбора пула
  const handleSelectPool = async (pool) => {
    try {
      console.log("Выбор пула:", pool)

      // Обновляем выбранный пул в базе данных
      if (user?.id) {
        const { error } = await supabase.from("users").update({ active_pool_id: pool.id }).eq("id", user.id)

        if (error) {
          console.error("Ошибка при обновлении active_pool_id:", error)
          throw error
        }
      }

      // Обновляем локальное состояние
      setSelectedPoolId(pool.id)

      // Вызываем колбэк для обновления родительского компонента
      if (onPoolSelect) {
        onPoolSelect(pool)
      }

      // Закрываем модальное окно
      onClose()
    } catch (error) {
      console.error("Ошибка при выборе пула:", error)
      alert("Не удалось выбрать пул")
    }
  }

  // Функция для получения цвета в зависимости от сложности пула
  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 1) return "green"
    if (difficulty <= 2) return "blue"
    if (difficulty <= 3) return "purple"
    return "red"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-[#242838]/95 backdrop-blur-sm p-4 rounded-lg w-[90%] max-w-md border border-blue-500/20"
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">Майнинг пулы</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Пулы недоступны</p>
          </div>
        ) : (
          <div
            className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar"
            style={{ overflowY: "auto", maxHeight: "60vh" }}
          >
            {pools.map((pool) => (
              <div
                key={pool.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedPoolId === pool.id
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-[#1a1d2d] border-[#2a2f45] hover:border-blue-500/50"
                }`}
                onClick={() => handleSelectPool(pool)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 bg-${getDifficultyColor(pool.difficulty)}-500/20 rounded-lg flex items-center justify-center mr-3`}
                  >
                    <span className="text-2xl">
                      {pool.difficulty <= 1 ? "🌊" : pool.difficulty <= 2 ? "⛏️" : pool.difficulty <= 3 ? "🔥" : "💀"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{pool.name}</h4>
                    <p className="text-sm text-gray-400">{pool.description}</p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">
                    Сложность:{" "}
                    <span className={`text-${getDifficultyColor(pool.difficulty)}-400`}>{pool.difficulty}x</span>
                  </div>
                  <div className="text-gray-400">
                    Награда: <span className="text-blue-400">x{pool.reward_multiplier}</span>
                  </div>
                  <div className="text-gray-400">
                    Стабильность: <span className="text-blue-400">{pool.stability}%</span>
                  </div>
                  <div className="text-gray-400">
                    Комиссия: <span className="text-blue-400">{pool.fee}%</span>
                  </div>
                </div>

                {selectedPoolId === pool.id && (
                  <div className="mt-2 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      Текущий пул
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <style jsx global>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1a1d2d;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 10px;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #3b82f6 #1a1d2d;
  }
`}</style>
      </div>
    </div>
  )
}

