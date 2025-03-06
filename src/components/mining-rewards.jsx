"use client"

import { useState, useEffect } from "react"
import { Clock, Coins, ChevronRight, Loader, Database, TrendingUp, Zap } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewards = ({ userId, onCollect }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

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

        if (!data) {
          throw new Error("Данные о майнинге не найдены")
        }

        setMiningInfo(data)

        if (data.time_until_next_collection > 0) {
          setTimeLeft(data.time_until_next_collection * 1000)
        } else {
          setTimeLeft(0)
        }
      } catch (err) {
        console.error("Error in loadMiningInfo:", err)
        setError(err.message || "Произошла неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    loadMiningInfo()
    const interval = setInterval(loadMiningInfo, 5 * 60 * 1000)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) return 0
        return prev - 1000
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [userId])

  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleCollect = async (period) => {
    try {
      setCollecting(true)
      setError(null)

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
        period_hours_param: period,
      })

      if (error) throw error

      if (data.success) {
        onCollect(data.new_balance)
        if (!miningInfo.has_miner_pass) {
          setTimeLeft(8 * 60 * 60 * 1000)
        }

        const { data: miningData } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (miningData) {
          setMiningInfo(miningData)
        }

        alert(`Успешно собрано ${data.amount} монет! (Комиссия пула: ${data.fee_amount} монет)`)
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
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-center items-center py-4">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    )
  }

  if (!miningInfo || !miningInfo.miners || miningInfo.miners.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="text-sm text-gray-400 text-center">
          У вас пока нет майнеров. Приобретите майнеры в магазине, чтобы начать добывать монеты.
        </div>
      </div>
    )
  }

  const collectionProgress = miningInfo.has_miner_pass ? 100 : miningInfo.collection_progress || 0
  const reward = miningInfo.rewards?.[0] || { amount: 0, fee_amount: 0 }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      {/* Заголовок и таймер */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Coins className="text-yellow-500" size={18} />
          <span className="font-medium">Сбор наград</span>
        </div>
        {timeLeft > 0 && !miningInfo.has_miner_pass && (
          <div className="flex items-center gap-1 text-sm text-orange-400">
            <Clock size={14} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Прогресс-бар */}
      {!miningInfo.has_miner_pass && (
        <div className="mb-3">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${collectionProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{Math.min(100, Math.round(collectionProgress))}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Информация о пуле */}
      <div className="bg-gray-800/50 rounded-lg p-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="text-blue-500" size={14} />
            <span className="text-sm">Пул: {miningInfo.pool?.display_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">{miningInfo.pool?.multiplier}x</span>
            <span className="text-gray-400">{miningInfo.pool?.fee_percent}%</span>
          </div>
        </div>
      </div>

      {/* Статистика майнинга */}
      <div className="bg-gray-800/50 rounded-lg p-2.5 mb-3">
        <div className="grid grid-cols-2 gap-y-2">
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

      {/* Блок наград */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">За 8 часов:</div>
            <div className="text-lg font-medium">{reward.amount} 💎</div>
            <div className="text-xs text-gray-500">Комиссия пула: {reward.fee_amount} 💎</div>
          </div>
          <button
            onClick={() => handleCollect(8)}
            disabled={collecting || (timeLeft > 0 && !miningInfo.has_miner_pass)}
            className={`
              flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
              ${
                collecting
                  ? "bg-gray-700 text-gray-400 cursor-wait"
                  : timeLeft > 0 && !miningInfo.has_miner_pass
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-400"
              }
            `}
          >
            {collecting ? (
              <>
                <Loader size={14} className="animate-spin" />
                <span>Сбор...</span>
              </>
            ) : (
              <>
                <span>Собрать</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-400 text-center">{error}</div>}
    </div>
  )
}

export default MiningRewards

