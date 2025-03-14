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
    hasMinerPass: false,
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
          // 1. Получаем количество майнеров из поля total_miners
          const { data: minerStats, error: minerStatsError } = await supabase
            .from("user_miners")
            .select("total_miners")
            .eq("user_id", user.id)
            .single()

          let totalMiners = 0
          if (minerStatsError) {
            console.error("Ошибка при запросе total_miners:", minerStatsError)
          } else {
            totalMiners = minerStats?.total_miners || 0
          }

          // 2. Получаем количество приглашенных друзей из поля referral_count
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("referral_count")
            .eq("id", user.id)
            .single()

          let invitedFriends = 0
          if (userError) {
            console.error("Ошибка при запросе referral_count:", userError)
          } else {
            invitedFriends = userData?.referral_count || 0
          }

          // 3. Проверяем наличие активного Miner Pass
          let hasMinerPass = user.has_miner_pass || false

          // Дополнительно проверяем в таблице user_passes
          const { data: passData, error: passError } = await supabase
            .from("user_passes")
            .select("*")
            .eq("user_id", user.id)
            .eq("pass_type", "miner_pass")
            .eq("is_active", true)
            .lte("purchase_date", new Date().toISOString())
            .gte("expiry_date", new Date().toISOString())
            .maybeSingle()

          // Если есть активный пропуск в таблице user_passes, устанавливаем hasMinerPass в true
          if (!passError && passData) {
            hasMinerPass = true

            // Если в таблице users не установлен флаг has_miner_pass, обновляем его
            if (!user.has_miner_pass) {
              await supabase.from("users").update({ has_miner_pass: true }).eq("id", user.id)
            }
          }

          setUserStats({
            totalMiners,
            invitedFriends,
            hasMinerPass,
          })

          console.log("Статистика пользователя:", { totalMiners, invitedFriends, hasMinerPass })
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
              // Оригинальные данные для передачи в родительский компонент
              original: {
                id: pool.id,
                name: pool.name,
                display_name: pool.display_name,
                multiplier: pool.multiplier,
                fee_percent: pool.fee_percent,
              },
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
            original: {
              id: 3,
              name: "premium",
              display_name: "Премиум пул",
              multiplier: 1.3,
              fee_percent: 1,
            },
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
            original: {
              id: 2,
              name: "advanced",
              display_name: "Продвинутый пул",
              multiplier: 1.15,
              fee_percent: 3,
            },
            requiresMinerPass: false,
            minMiners: 15,
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
            original: {
              id: 1,
              name: "standard",
              display_name: "Стандартный пул",
              multiplier: 1,
              fee_percent: 5,
            },
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
    // Премиум пул (id=3): требуется только Miner Pass
    if (pool.id === 3) {
      return userStats.hasMinerPass
    }

    // Продвинутый пул (id=2):
    // 1. Если есть Miner Pass - доступен всегда
    // 2. Иначе - нужно иметь 15+ майнеров И 20+ приглашенных друзей
    if (pool.id === 2) {
      if (userStats.hasMinerPass) {
        return true
      }

      return userStats.totalMiners >= pool.minMiners && userStats.invitedFriends >= pool.minInvitedFriends
    }

    // Стандартный пул (id=1): доступен всем
    return true
  }

  // Функция для получения требований для разблокировки пула
  const getPoolRequirements = (pool) => {
    // Премиум пул
    if (pool.id === 3) {
      return <div className="text-xs text-gray-400 mt-1">Требуется: Miner Pass</div>
    }

    // Продвинутый пул
    if (pool.id === 2) {
      return (
        <div className="text-xs text-gray-400 mt-1">
          Требуется: Miner Pass или ({pool.minMiners}+ майнеров и {pool.minInvitedFriends}+ приглашенных)
        </div>
      )
    }

    return null
  }

  // Изменяем функцию handleSelectPool для мгновенного закрытия модального окна
  // и обновления UI без ожидания ответа сервера

  // Функция для выбора пула
  const handleSelectPool = async (pool) => {
    // Проверяем доступность пула
    if (!isPoolAvailable(pool)) {
      alert("Этот пул недоступен. Выполните необходимые требования для разблокировки.")
      return
    }

    try {
      console.log("Выбор пула:", pool)

      // Создаем объект с данными пула для передачи в родительский компонент
      const poolData = {
        id: pool.id,
        name: pool.original.name,
        display_name: pool.name, // Используем отображаемое имя из UI
        multiplier: pool.reward_multiplier,
        fee_percent: pool.fee,
      }

      console.log("Передаем данные пула в родительский компонент:", poolData)

      // Обновляем локальное состояние
      setSelectedPoolId(pool.id)

      // Закрываем модальное окно НЕМЕДЛЕННО
      onClose()

      // Вызываем колбэк для обновления родительского компонента
      if (onPoolSelect) {
        onPoolSelect(poolData)
      }

      // Запускаем обновление на сервере в фоновом режиме
      if (user?.id) {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.rpc("select_mining_pool", {
              user_id_param: user.id,
              pool_id_param: pool.id,
            })

            if (error) {
              console.error("Ошибка при вызове select_mining_pool:", error)
            } else {
              console.log("Результат select_mining_pool:", data)
            }
          } catch (err) {
            console.error("Ошибка при обновлении пула на сервере:", err)
          }
        }, 100)
      }
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
              const isSelected = selectedPoolId === pool.id

              return (
                <div
                  key={pool.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isAvailable ? "cursor-pointer" : "opacity-70 cursor-not-allowed"
                  } ${isSelected ? "border-blue-500" : "border-transparent"} ${styles.container}`}
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
                    {isSelected && isAvailable && (
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

