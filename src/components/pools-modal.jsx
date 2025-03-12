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
            id: 3,
            name: "Премиум пул",
            description: "Элитный пул с максимальной эффективностью",
            difficulty: 5,
            reward_multiplier: 1.3,
            stability: 99,
            fee: 1,
          },
          {
            id: 2,
            name: "Продвинутый пул",
            description: "Пул с улучшенной эффективностью",
            difficulty: 3,
            reward_multiplier: 1.15,
            stability: 97,
            fee: 3,
          },
          {
            id: 1,
            name: "Стандартный пул",
            description: "Базовый пул для всех майнеров",
            difficulty: 1,
            reward_multiplier: 1,
            stability: 95,
            fee: 5,
          },
        ]

        setPools(testPools)

        if (currentPool?.id) {
          setSelectedPoolId(currentPool.id)
        } else {
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

      if (user?.id) {
        // Обновляем mining_pool у пользователя
        const { error } = await supabase.from("users").update({ mining_pool: pool.id }).eq("id", user.id)

        if (error) {
          console.error("Ошибка при обновлении mining_pool:", error)
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
      alert("Не удалось выбрать пул. Пожалуйста, попробуйте позже.")
    }
  }

  // Функция для получения стилей пула в зависимости от типа
  const getPoolStyles = (pool) => {
    const styles = {
      container: "",
      title: "",
      icon: "",
    }

    if (pool.difficulty >= 5) {
      // Премиум пул
      styles.container = "bg-gradient-to-br from-yellow-900/30 to-yellow-600/20 border-yellow-600/30"
      styles.title = "text-yellow-400 font-semibold"
      styles.icon = "💀"
    } else if (pool.difficulty >= 3) {
      // Продвинутый пул
      styles.container = "bg-gradient-to-br from-purple-900/30 to-purple-600/20 border-purple-600/30"
      styles.title = "text-purple-400"
      styles.icon = "🔥"
    } else {
      // Стандартный пул
      styles.container = "bg-gradient-to-br from-blue-900/30 to-blue-600/20 border-blue-600/30"
      styles.title = "text-blue-400"
      styles.icon = "🌊"
    }

    return styles
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d2d] p-4 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-blue-400">Майнинг пулы</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>Пулы недоступны</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {pools.map((pool) => {
              const styles = getPoolStyles(pool)
              return (
                <div
                  key={pool.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${styles.container}`}
                  onClick={() => handleSelectPool(pool)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-2xl mr-2">{styles.icon}</span>
                      <div>
                        <h4 className={`${styles.title} text-sm`}>{pool.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1">{pool.description}</p>
                      </div>
                    </div>
                    {selectedPoolId === pool.id && (
                      <div className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Активен</div>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className="text-gray-400 flex items-center">
                      <span className="w-3 h-3 inline-block mr-1">⚙️</span>
                      Сложность: <span className={`${styles.title} ml-1`}>{pool.difficulty}x</span>
                    </div>
                    <div className="text-gray-400 flex items-center">
                      <span className="w-3 h-3 inline-block mr-1">💎</span>
                      Награда: <span className={`${styles.title} ml-1`}>x{pool.reward_multiplier}</span>
                    </div>
                    <div className="text-gray-400 flex items-center">
                      <span className="w-3 h-3 inline-block mr-1">🔄</span>
                      Стабильность: <span className={`${styles.title} ml-1`}>{pool.stability}%</span>
                    </div>
                    <div className="text-gray-400 flex items-center">
                      <span className="w-3 h-3 inline-block mr-1">💰</span>
                      Комиссия: <span className={`${styles.title} ml-1`}>{pool.fee}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <style jsx global>{`
          .custom-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overscroll-behavior: contain;
          }

          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  )
}

