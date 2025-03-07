"use client"

import { useState, useEffect, useCallback } from "react"
import { Coins, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewardsNew = ({ userId, onCollect, balance = 0 }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningProgress, setMiningProgress] = useState(null)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [showPeriods, setShowPeriods] = useState(false)
  const [rewards, setRewards] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [updateInterval, setUpdateInterval] = useState(null)

  // Функция для загрузки прогресса майнинга
  const loadMiningProgress = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)

      const { data, error } = await supabase.rpc("get_mining_progress", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Mining progress loaded:", data)
      setMiningProgress(data)

      // Устанавливаем время до следующего сбора
      if (data.time_until_collection > 0) {
        setTimeLeft(data.time_until_collection * 1000)
      } else {
        setTimeLeft(0)
      }

      // Генерируем варианты наград
      if (data.hashrate > 0) {
        const settings = await supabase.rpc("get_mining_settings")
        if (settings.error) throw settings.error

        const minPeriod = settings.data.min_collection_period_hours
        const standardPeriod = settings.data.collection_interval_hours
        const maxPeriod = settings.data.max_collection_period_hours
        const baseRate = settings.data.base_reward_rate

        // Получаем информацию о пуле
        const { data: poolData } = await supabase
          .from("mining_pools")
          .select("*")
          .eq("name", data.pool_name || "standard")
          .single()

        const poolMultiplier = data.pool_multiplier
        const feePercent = poolData?.fee_percent || 5

        // Рассчитываем награды для разных периодов
        const rewardsData = [
          {
            period: minPeriod,
            amount: calculateReward(data.hashrate, minPeriod, baseRate, poolMultiplier, feePercent),
            fee_amount: calculateFee(data.hashrate, minPeriod, baseRate, poolMultiplier, feePercent),
            total_amount: calculateTotal(data.hashrate, minPeriod, baseRate, poolMultiplier),
          },
          {
            period: standardPeriod,
            amount: calculateReward(data.hashrate, standardPeriod, baseRate, poolMultiplier, feePercent),
            fee_amount: calculateFee(data.hashrate, standardPeriod, baseRate, poolMultiplier, feePercent),
            total_amount: calculateTotal(data.hashrate, standardPeriod, baseRate, poolMultiplier),
          },
          {
            period: maxPeriod,
            amount: calculateReward(data.hashrate, maxPeriod, baseRate, poolMultiplier, feePercent),
            fee_amount: calculateFee(data.hashrate, maxPeriod, baseRate, poolMultiplier, feePercent),
            total_amount: calculateTotal(data.hashrate, maxPeriod, baseRate, poolMultiplier),
          },
        ]

        setRewards(rewardsData)

        // Устанавливаем выбранный период по умолчанию (стандартный)
        if (!selectedPeriod) {
          setSelectedPeriod(rewardsData[1])
        }
      }
    } catch (err) {
      console.error("Error loading mining progress:", err)
      setError(err.message || "Произошла ошибка при загрузке прогресса майнинга")
    } finally {
      setLoading(false)
    }
  }, [userId, selectedPeriod])

  // Функция для расчета награды
  const calculateReward = (hashrate, period, baseRate, multiplier, feePercent) => {
    const total = hashrate * period * baseRate * multiplier
    const fee = total * (feePercent / 100)
    return Number.parseFloat((total - fee).toFixed(2))
  }

  // Функция для расчета комиссии
  const calculateFee = (hashrate, period, baseRate, multiplier, feePercent) => {
    const total = hashrate * period * baseRate * multiplier
    return Number.parseFloat((total * (feePercent / 100)).toFixed(2))
  }

  // Функция для расчета общей суммы
  const calculateTotal = (hashrate, period, baseRate, multiplier) => {
    return Number.parseFloat((hashrate * period * baseRate * multiplier).toFixed(2))
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (!userId) return

    console.log("MiningRewardsNew component mounted")
    loadMiningProgress()

    // Устанавливаем интервал для обновления прогресса каждые 30 секунд
    const interval = setInterval(() => {
      loadMiningProgress()
    }, 30000)

    setUpdateInterval(interval)

    return () => {
      console.log("MiningRewardsNew component unmounted")
      if (updateInterval) clearInterval(updateInterval)
    }
  }, [userId, loadMiningProgress])

  // Обновляем таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev <= 1000 ? 0 : prev - 1000
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Функция для сбора наград
  const handleCollect = async () => {
    if (!userId || !selectedPeriod) return

    try {
      setCollecting(true)
      setError(null)

      const { data, error } = await supabase.rpc("collect_mining_rewards_new", {
        user_id_param: userId,
        period_hours_param: selectedPeriod.period,
      })

      if (error) throw error

      if (data.success) {
        console.log("Rewards collected:", data)

        // Вызываем onCollect с новым балансом
        if (typeof onCollect === "function") {
          onCollect(data.new_balance)
        }

        // Обновляем время до следующего сбора
        if (!miningProgress.has_pass && !miningProgress.allow_anytime_collection) {
          setTimeLeft(miningProgress.collection_interval_hours * 60 * 60 * 1000)
        }

        // Перезагружаем данные о майнинге
        await loadMiningProgress()
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      setError(err.message || "Произошла ошибка при сборе наград")
    } finally {
      setCollecting(false)
    }
  }

  // Форматируем время
  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Форматируем число с 2 знаками после запятой
  const formatNumber = (num) => {
    return Number.parseFloat(num).toFixed(2)
  }

  // Рассчитываем прогресс для прогресс-бара
  const calculateProgress = () => {
    if (!miningProgress) return 0
    return miningProgress.collection_progress || 0
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

  // Проверяем наличие майнеров
  if (!miningProgress || miningProgress.hashrate <= 0) {
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
            {timeLeft > 0 && !miningProgress.has_pass && !miningProgress.allow_anytime_collection && (
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
          {showPeriods && rewards.length > 0 && (
            <div className="mt-1 bg-gray-800/30 rounded-lg overflow-hidden">
              {rewards.map((reward, index) => (
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
            (timeLeft > 0 && !miningProgress.has_pass && !miningProgress.allow_anytime_collection) ||
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
            <span className="text-green-400">{formatNumber(miningProgress.mined_amount)}</span>
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
            <span className="text-white">Множитель пула:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">{miningProgress.pool_multiplier}x</span>
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
              <span className="text-white">{formatNumber(miningProgress.total_mined)}</span>
              <span className="text-blue-400">💎</span>
            </div>
          </div>
        </div>

        {/* Хешрейт */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400">⚡</span>
              <span className="text-gray-400">Хешрейт:</span>
              <span className="text-white">{formatNumber(miningProgress.hashrate)}</span>
              <span className="text-gray-400">H/s</span>
            </div>
          </div>
        </div>

        {/* Доход в час */}
        <div className="bg-[#0F1729]/90 p-2.5 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500">💰</span>
              <span className="text-gray-400">Доход в час:</span>
              <span className="text-white">
                {formatNumber(miningProgress.hashrate * miningProgress.pool_multiplier * 0.5)}
              </span>
              <span className="text-blue-400">💎/час</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-400 text-center mt-2">{error}</div>}
    </div>
  )
}

export default MiningRewardsNew

