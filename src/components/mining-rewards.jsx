"use client"

import { useState, useEffect } from "react"
import { Coins } from "lucide-react"
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
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!miningInfo?.miners?.length) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={16} />
            <span className="text-white">Сбор наград</span>
          </div>
          <div className="flex items-center gap-2">
            {timeLeft > 0 && !miningInfo.has_miner_pass && (
              <span className="text-orange-400 font-medium">{formatTime(timeLeft)}</span>
            )}
            <button
              onClick={handleCollect}
              disabled={collecting || (timeLeft > 0 && !miningInfo.has_miner_pass)}
              className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              Собрать
            </button>
          </div>
        </div>
      </div>

      {/* Баланс */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Баланс:</span>
          <span className="text-white">{balance}</span>
          <span className="text-blue-400">💎</span>
        </div>
        {!miningInfo.has_miner_pass && (
          <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
              style={{ width: `${miningInfo.collection_progress || 0}%` }}
            />
          </div>
        )}
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

