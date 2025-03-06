"use client"

import { useState, useEffect, useRef } from "react"
import { Coins, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewards = ({ userId, onCollect, balance = 0, totalHashrate = 0, poolMultiplier = 1 }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPeriodMined, setCurrentPeriodMined] = useState(0)
  const [lastCollectionTime, setLastCollectionTime] = useState(null)
  const [currentMined, setCurrentMined] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [showPeriods, setShowPeriods] = useState(false)

  // Используем useRef для предотвращения утечек памяти
  const timerRef = useRef(null)
  const miningTimerRef = useRef(null)
  const syncTimeoutRef = useRef(null)
  const isComponentMounted = useRef(true)
  const resetInProgressRef = useRef(false) // Флаг для отслеживания процесса сброса

  // Функция для синхронизации прогресса с базой данных
  const syncProgress = async () => {
    if (!userId || !isComponentMounted.current || resetInProgressRef.current) return

    try {
      console.log("Syncing progress to database:", {
        current_mined: currentMined,
        last_update: new Date(lastUpdate).toISOString(),
      })

      await supabase.rpc("update_mining_progress", {
        user_id_param: userId,
        current_mined_param: currentMined,
        last_update_param: new Date(lastUpdate).toISOString(),
      })
    } catch (err) {
      console.error("Error syncing progress:", err)
    }
  }

  // Функция загрузки данных о майнинге
  const loadMiningInfo = async () => {
    if (!userId || !isComponentMounted.current) return

    try {
      setError(null)

      const { data, error } = await supabase.rpc("get_mining_info", {
        user_id_param: userId,
      })

      if (!isComponentMounted.current) return

      if (error) throw error
      if (!data) throw new Error("Данные о майнинге не найдены")

      console.log("Mining info loaded:", data)
      setMiningInfo(data)

      // Устанавливаем начальные значения из базы данных
      if (data.current_mined !== undefined) {
        setCurrentMined(Number(data.current_mined))
      }
      if (data.last_update) {
        setLastUpdate(new Date(data.last_update).getTime())
      }

      if (data.time_until_next_collection > 0) {
        setTimeLeft(data.time_until_next_collection * 1000)
      } else {
        setTimeLeft(0)
      }

      // Обновляем время последнего сбора
      if (data.last_collection !== lastCollectionTime) {
        setLastCollectionTime(data.last_collection)
        setCurrentPeriodMined(0)
      }

      // Устанавливаем выбранный период по умолчанию
      if (data.rewards && data.rewards.length > 0 && !selectedPeriod) {
        // Выбираем стандартный период (обычно второй в списке)
        const defaultPeriodIndex = Math.min(1, data.rewards.length - 1)
        setSelectedPeriod(data.rewards[defaultPeriodIndex])
      }

      // Рассчитываем текущую добычу
      if (data.total_hashrate && !collecting) {
        const baseRewardRate = data.settings?.base_reward_rate || 0.5
        const hourlyRate = data.total_hashrate * baseRewardRate * (data.pool?.multiplier || 1.0)
        const timeSinceLastCollection = lastCollectionTime
          ? (Date.now() - new Date(lastCollectionTime).getTime()) / (1000 * 60 * 60)
          : 0
        const collectionIntervalHours = data.settings?.collection_interval_hours || 8
        const minedAmount = hourlyRate * Math.min(timeSinceLastCollection, collectionIntervalHours)
        setCurrentPeriodMined(Math.round(minedAmount * 100) / 100)
      }
    } catch (err) {
      console.error("Error in loadMiningInfo:", err)
      if (isComponentMounted.current) {
        setError(err.message || "Произошла неизвестная ошибка")
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false)
      }
    }
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true
    console.log("MiningRewards component mounted")

    const fetchData = async () => {
      await loadMiningInfo()
    }

    fetchData()

    // Устанавливаем таймер для обратного отсчета
    timerRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        setTimeLeft((prev) => {
          const newTime = prev <= 1000 ? 0 : prev - 1000
          return newTime
        })
      }
    }, 1000)

    return () => {
      console.log("MiningRewards component unmounted")
      isComponentMounted.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (miningTimerRef.current) clearInterval(miningTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [userId])

  // Обновляем значение добытых монет каждую секунду и синхронизируем с базой данных
  useEffect(() => {
    // Очищаем предыдущий таймер, если он есть
    if (miningTimerRef.current) clearInterval(miningTimerRef.current)

    miningTimerRef.current = setInterval(() => {
      if (!isComponentMounted.current || resetInProgressRef.current) return

      const now = Date.now()
      const timeDiff = (now - lastUpdate) / 1000 / 3600 // разница в часах
      const baseRewardRate = miningInfo?.settings?.base_reward_rate || 0.5

      // Базовая ставка за единицу хешрейта в час
      const newMined = totalHashrate * baseRewardRate * poolMultiplier * timeDiff

      setCurrentMined((prev) => {
        const updated = prev + newMined

        // Устанавливаем таймер для синхронизации
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }

        // Синхронизируем с базой данных каждые 10 секунд
        syncTimeoutRef.current = setTimeout(() => {
          syncProgress()
        }, 10000)

        return updated
      })
      setLastUpdate(now)
    }, 1000)

    return () => {
      if (miningTimerRef.current) clearInterval(miningTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [totalHashrate, poolMultiplier, lastUpdate, miningInfo])

  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleCollect = async () => {
    if (!userId || !isComponentMounted.current || !selectedPeriod) return

    try {
      setCollecting(true)
      setError(null)

      // Устанавливаем флаг сброса, чтобы предотвратить обновление счетчика во время сбора
      resetInProgressRef.current = true

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
        period_hours_param: selectedPeriod.period,
      })

      if (!isComponentMounted.current) return

      if (error) throw error

      if (data.success) {
        // Вызываем onCollect с новым балансом
        if (typeof onCollect === "function") {
          onCollect(data.new_balance)
        }

        // Обновляем локальное состояние
        const collectionIntervalHours = miningInfo?.settings?.collection_interval_hours || 8
        const allowAnytimeCollection = miningInfo?.settings?.allow_anytime_collection || false
        if (!miningInfo.has_miner_pass && !allowAnytimeCollection) {
          setTimeLeft(collectionIntervalHours * 60 * 60 * 1000)
        }

        // ВАЖНО: Сбрасываем счетчики добытых монет
        setCurrentPeriodMined(0)
        setCurrentMined(0)

        // Обновляем lastCollectionTime на текущее время
        const now = new Date().toISOString()
        setLastCollectionTime(now)
        setLastUpdate(Date.now())

        // Синхронизируем с базой данных
        await supabase.rpc("update_mining_progress", {
          user_id_param: userId,
          current_mined_param: 0, // Явно устанавливаем 0
          last_update_param: new Date().toISOString(),
        })

        // Обновляем miningInfo локально
        setMiningInfo((prev) => ({
          ...prev,
          last_collection: now,
          time_until_next_collection:
            miningInfo.has_miner_pass || allowAnytimeCollection ? 0 : collectionIntervalHours * 60 * 60,
          collection_progress: miningInfo.has_miner_pass || allowAnytimeCollection ? 100 : 0,
          current_mined: 0, // Явно устанавливаем 0
          stats: {
            ...prev.stats,
            total_mined: (Number.parseFloat(prev.stats.total_mined) + data.amount).toFixed(2),
          },
        }))

        // Перезагружаем данные о майнинге
        await loadMiningInfo()
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      if (isComponentMounted.current) {
        setError("Ошибка при сборе наград")
      }
    } finally {
      if (isComponentMounted.current) {
        setCollecting(false)
        // Снимаем флаг сброса
        resetInProgressRef.current = false
      }
    }
  }

  // Форматируем число с 2 знаками после запятой
  const formatNumber = (num) => {
    return Number.parseFloat(num).toFixed(2)
  }

  // Рассчитываем прогресс для прогресс-бара
  const calculateProgress = () => {
    if (!timeLeft || miningInfo?.has_miner_pass || miningInfo?.settings?.allow_anytime_collection) return 100
    const collectionIntervalHours = miningInfo?.settings?.collection_interval_hours || 8
    const totalTime = collectionIntervalHours * 60 * 60 * 1000 // в миллисекундах
    const elapsed = totalTime - timeLeft
    return (elapsed / totalTime) * 100
  }

  if (loading) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Проверяем наличие майнеров более надежным способом
  if (!miningInfo?.miners || miningInfo.miners.length === 0) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="text-sm text-gray-400">У вас пока нет майнеров</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Сбор наград */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={16} />
            <span className="text-white">Сбор наград</span>
          </div>
          <div className="flex items-center gap-2">
            {timeLeft > 0 && !miningInfo.has_miner_pass && !miningInfo.settings?.allow_anytime_collection && (
              <span className="text-orange-400 font-medium">{formatTime(timeLeft)}</span>
            )}
          </div>
        </div>

        {/* Выбор периода сбора */}
        <div className="mb-2">
          <div
            className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg cursor-pointer"
            onClick={() => setShowPeriods(!showPeriods)}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-400" />
              <span className="text-sm text-gray-300">
                {selectedPeriod ? `Период: ${selectedPeriod.period} ч` : "Выберите период"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedPeriod && <span className="text-sm text-green-400">+{selectedPeriod.amount} 💎</span>}
              {showPeriods ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Выпадающий список периодов */}
          {showPeriods && miningInfo.rewards && (
            <div className="mt-1 bg-gray-800/30 rounded-lg overflow-hidden">
              {miningInfo.rewards.map((reward, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-800/70 ${
                    selectedPeriod?.period === reward.period ? "bg-gray-800/70" : ""
                  }`}
                  onClick={() => {
                    setSelectedPeriod(reward)
                    setShowPeriods(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-sm text-gray-300">{reward.period} ч</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-400">+{reward.amount} 💎</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка сбора */}
        <button
          onClick={handleCollect}
          disabled={
            collecting ||
            (timeLeft > 0 && !miningInfo.has_miner_pass && !miningInfo.settings?.allow_anytime_collection) ||
            !selectedPeriod
          }
          className="w-full py-2 rounded-lg text-sm font-medium transition-all
            bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {collecting ? "Сбор..." : "Собрать награды"}
        </button>
      </div>

      {/* Баланс */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Баланс:</span>
            <span className="text-white">{Number(balance).toFixed(2)}</span>
            <span className="text-blue-400">💎</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">+</span>
            <span className="text-green-400">{formatNumber(currentMined)}</span>
            <span className="text-blue-400">💎</span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Пул */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">⊟</span>
            <span className="text-white">Пул: {miningInfo.pool?.display_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">{miningInfo.pool?.multiplier}x</span>
            <span className="text-gray-400">{miningInfo.pool?.fee_percent}%</span>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="space-y-1">
        {/* Всего добыто */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">↗</span>
              <span className="text-gray-400">Всего добыто:</span>
              <span className="text-white">{miningInfo.stats?.total_mined}</span>
              <span className="text-blue-400">💎</span>
            </div>
          </div>
        </div>

        {/* Средний доход */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500">💰</span>
              <span className="text-gray-400">Средний доход:</span>
              <span className="text-white">{miningInfo.stats?.daily_average}</span>
              <span className="text-blue-400">💎/день</span>
            </div>
          </div>
        </div>

        {/* Хешрейт */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400">⚡</span>
              <span className="text-gray-400">Хешрейт:</span>
              <span className="text-white">{miningInfo.total_hashrate}</span>
              <span className="text-gray-400">H/s</span>
            </div>
          </div>
        </div>

        {/* Дней в майнинге */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400">🕒</span>
              <span className="text-gray-400">Дней в майнинге:</span>
              <span className="text-white">{miningInfo.stats?.mining_days}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-400 text-center mt-2">{error}</div>}
    </div>
  )
}

export default MiningRewards

