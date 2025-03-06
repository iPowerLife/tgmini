"use client"

import { useState, useEffect } from "react"
import { Clock, Coins, Loader, Database, TrendingUp, Zap } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewards = ({ userId, onCollect, balance = 0 }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPeriodMined, setCurrentPeriodMined] = useState(0)
  const [lastCollectionTime, setLastCollectionTime] = useState(null)

  useEffect(() => {
    if (!userId) return

    const loadMiningInfo = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (error) throw error
        if (!data) throw new Error("Данные о майнинге не найдены")

        setMiningInfo(data)

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

        // Рассчитываем текущую добычу
        if (data.total_hashrate && !collecting) {
          const hourlyRate = data.total_hashrate * 0.5 * (data.pool?.multiplier || 1.0)
          const timeSinceLastCollection = lastCollectionTime
            ? (Date.now() - new Date(lastCollectionTime).getTime()) / (1000 * 60 * 60)
            : 0
          const minedAmount = hourlyRate * Math.min(timeSinceLastCollection, 8)
          setCurrentPeriodMined(Math.round(minedAmount * 100) / 100)
        }
      } catch (err) {
        console.error("Error in loadMiningInfo:", err)
        setError(err.message || "Произошла неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    loadMiningInfo()
    const interval = setInterval(loadMiningInfo, 30 * 1000)
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1000 ? 0 : prev - 1000))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [userId, lastCollectionTime, collecting])

  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleCollect = async () => {
    try {
      setCollecting(true)
      setError(null)

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
        period_hours_param: 8,
      })

      if (error) throw error

      if (data.success) {
        onCollect(data.new_balance)
        if (!miningInfo.has_miner_pass) {
          setTimeLeft(8 * 60 * 60 * 1000)
        }
        setCurrentPeriodMined(0)

        const { data: miningData } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (miningData) {
          setMiningInfo(miningData)
          setLastCollectionTime(miningData.last_collection)
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      setError("Ошибка при сборе наград")
    } finally {
      setCollecting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4">
        <div className="flex justify-center items-center py-4">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    )
  }

  if (!miningInfo?.miners?.length) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4">
        <div className="text-sm text-gray-400 text-center">
          У вас пока нет майнеров. Приобретите майнеры в магазине, чтобы начать добывать монеты.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      {/* Заголовок с текущей добычей и кнопкой сбора */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="text-yellow-500" size={18} />
          <span className="font-medium">Сбор наград</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-400">{currentPeriodMined.toFixed(2)} 💎</span>
          {timeLeft > 0 && !miningInfo.has_miner_pass && (
            <span className="text-orange-400">{formatTime(timeLeft)}</span>
          )}
          <button
            onClick={handleCollect}
            disabled={collecting || (timeLeft > 0 && !miningInfo.has_miner_pass)}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-all
              ${
                collecting
                  ? "bg-gray-700 text-gray-400 cursor-wait"
                  : timeLeft > 0 && !miningInfo.has_miner_pass
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-400"
              }
            `}
          >
            {collecting ? "Сбор..." : "Собрать"}
          </button>
        </div>
      </div>

      {/* Баланс и прогресс-бар */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-gray-400">Баланс:</span>
          <span className="font-medium">{balance} 💎</span>
        </div>
        {!miningInfo.has_miner_pass && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${miningInfo.collection_progress || 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Информация о пуле */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="text-blue-500" size={14} />
          <span className="text-sm">Пул: {miningInfo.pool?.display_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-400">{miningInfo.pool?.multiplier}x</span>
          <span className="text-gray-400">{miningInfo.pool?.fee_percent}%</span>
        </div>
      </div>

      {/* Статистика майнинга */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-sm text-gray-400">Всего добыто:</span>
            <span className="text-sm">{miningInfo.stats?.total_mined} 💎</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-sm text-gray-400">Средний доход:</span>
            <span className="text-sm">{miningInfo.stats?.daily_average} 💎/день</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-sm text-gray-400">Хешрейт:</span>
            <span className="text-sm">{miningInfo.total_hashrate} H/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-purple-400" />
            <span className="text-sm text-gray-400">Дней в майнинге:</span>
            <span className="text-sm">{miningInfo.stats?.mining_days}</span>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-400 text-center">{error}</div>}
    </div>
  )
}

export default MiningRewards

