"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function PoolsModal({ onClose, user, currentPool, onPoolSelect }) {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPoolId, setSelectedPoolId] = useState(null)
  const [userStats, setUserStats] = useState({
    totalMiners: 0,
    invitedFriends: 0,
  })

  // Загрузка данных о пулах и статистики пользователя
  useEffect(() => {
    const fetchPoolsAndStats = async () => {
      try {
        setLoading(true)

        // Получаем доступные пулы из таблицы mining_pools с условиями доступа
        const { data: poolsData, error: poolsError } = await supabase
          .from("mining_pools")
          .select("*, requires_miner_pass, min_miners, min_invited_friends")
          .order("fee_percent", { ascending: true })

        if (poolsError) {
          console.error("Ошибка при запросе mining_pools:", poolsError)
          throw poolsError
        }

        console.log("Данные mining_pools с условиями:", poolsData)

        // Получаем статистику пользователя для проверки доступа к пулам
        if (user?.id) {
          // 1. Получаем количество майнеров
          const { data: minersData, error: minersError } = await supabase
            .from("user_miners")
            .select("quantity")
            .eq("user_id", user.id)

          if (minersError) {
            console.error("Ошибка при запросе user_miners:", minersError)
          } else {
            const totalMiners = minersData?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

            // 2. Получаем количество приглашенных друзей
            const { data: friendsData, error: friendsError } = await supabase
              .from("users")
              .select("id")
              .eq("invited_by", user.id)

            const invitedFriends = friendsError ? 0 : friendsData?.length || 0

            setUserStats({
              totalMiners,
              invitedFriends,
            })

            console.log("Статистика пользователя:", { totalMiners, invitedFriends, hasMinerPass: user.hasMinerPass })
          }
        }

        // Форматируем данные пулов
        const formattedPools = poolsData
          ? poolsData.map((pool) => ({
              id: pool.id,
              name: pool.display_name || pool.name,
              description: pool.description || "Майнинг пул",
              difficulty: pool.min_miners || 1,
              reward_multiplier: pool.multiplier || 1,
              stability: 100 - (pool.fee_percent || 0),
              fee: pool.fee_percent || 0,
              // Условия доступа
              requiresMinerPass: pool.requires_miner_pass || false,
              minMiners: pool.min_miners || 0,
              minInvitedFriends: pool.min_invited_friends || 0,
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
            requiresMinerPass: true,
            minMiners: 0,
            minInvitedFriends: 0,
          },
          {
            id: 2,
            name: "Продвинутый пул",
            description: "Пул с улучшенной эффективностью",
            difficulty: 3,
            reward_multiplier: 1.15,
            stability: 97,
            fee: 3,
            requiresMinerPass: false,
            minMiners: 10,
            minInvitedFriends: 20,
          },
          {
            id: 1,
            name: "Стандартный пул",
            description: "Базовый пул для всех майнеров",
            difficulty: 1,
            reward_multiplier: 1,
            stability: 95,
            fee: 5,
            requiresMinerPass: false,
            minMiners: 0,
            minInvitedFriends: 0,
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

    fetchPoolsAndStats()
  }, [currentPool, user])

  // Функция для проверки доступности пула
  const isPoolAvailable = (pool) => {
    // Проверяем требование Miner Pass
    if (pool.requiresMinerPass && !user?.hasMinerPass) {
      return false
    }

    // Проверяем требование минимального количества майнеров
    if (pool.minMiners > 0 && userStats.totalMiners < pool.minMiners) {
      // Если есть Miner Pass, то пропускаем это требование для продвинутого пула
      if (pool.id === 2 && user?.hasMinerPass) {
        return true
      }

      // Проверяем требование минимального количества приглашенных друзей
      if (pool.minInvitedFriends > 0 && userStats.invitedFriends < pool.minInvitedFriends) {
        return false
      }
    }

    return true
  }

  // Функция для получения требований для разблокировки пула
  const getPoolRequirements = (pool) => {
    const requirements = []

    if (pool.requiresMinerPass) {
      requirements.push("Miner Pass")
    }

    if (pool.minMiners > 0) {
      requirements.push(`${pool.minMiners}+ майнеров`)
    }

    if (pool.minInvitedFriends > 0) {
      requirements.push(`${pool.minInvitedFriends}+ приглашенных`)
    }

    if (requirements.length === 0) return null

    // Для продвинутого пула добавляем "или" между требованиями
    if (pool.id === 2) {
      return <div className="text-xs text-gray-400 mt-1">Требуется: {requirements.join(" или ")}</div>
    }

    return <div className="text-xs text-gray-400 mt-1">Требуется: {requirements.join(", ")}</div>
  }

  // Функция для выбора пула
  const handleSelectPool = async (pool) => {
    // Проверяем доступность пула
    if (!isPoolAvailable(pool)) {
      alert("Этот пул недоступен. Выполните необходимые требования для разблокировки.")
      return
    }

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
              const isAvailable = isPoolAvailable(pool)

              return (
                <div
                  key={pool.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isAvailable ? "cursor-pointer" : "opacity-70 cursor-not-allowed"
                  } ${styles.container}`}
                  onClick={() => isAvailable && handleSelectPool(pool)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-2xl mr-2">{styles.icon}</span>
                      <div>
                        <div className="flex items-center">
                          <h4 className={`${styles.title} text-sm`}>{pool.name}</h4>
                          {!isAvailable && (
                            <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                              🔒 Заблокирован
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{pool.description}</p>
                        {!isAvailable && getPoolRequirements(pool)}
                      </div>
                    </div>
                    {selectedPoolId === pool.id && isAvailable && (
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

