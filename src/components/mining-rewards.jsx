"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2 } from "lucide-react"

export const MiningRewards = ({ userId }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const intervalRef = useRef(null)
  const isComponentMounted = useRef(true)

  // Загрузка данных
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true

    const loadData = async () => {
      try {
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        })

        if (!isComponentMounted.current) return

        if (error) throw error

        setMiningInfo(data)
        console.log("Mining info loaded:", data)
      } catch (err) {
        console.error("Error loading mining info:", err)
        if (isComponentMounted.current) {
          setError("Ошибка при загрузке данных майнинга")
        }
      } finally {
        if (isComponentMounted.current) {
          setLoading(false)
        }
      }
    }

    loadData()

    // Обновляем данные каждые 30 секунд
    intervalRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        setLastUpdate(Date.now())
      }
    }, 30000)

    return () => {
      isComponentMounted.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId, lastUpdate])

  // Сбор наград
  const collectRewards = async () => {
    if (!userId || collecting) return

    try {
      setCollecting(true)
      setError(null)
      setSuccess(null)

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
      })

      if (!isComponentMounted.current) return

      if (error) throw error

      if (data.success) {
        setSuccess(`Вы успешно собрали ${data.amount} монет!`)
        setLastUpdate(Date.now()) // Обновляем данные
      } else {
        setError(data.error || "Не удалось собрать награды")
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      if (isComponentMounted.current) {
        setError("Ошибка при сборе наград")
      }
    } finally {
      if (isComponentMounted.current) {
        setCollecting(false)
      }
    }
  }

  // Форматирование чисел
  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00"
    return Number.parseFloat(num).toFixed(decimals)
  }

  // Форматирование времени
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "Доступно сейчас"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} ч ${minutes} мин`
    } else {
      return `${minutes} мин`
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="text-yellow-500" size={18} />
          <span className="font-medium">Награды за майнинг</span>
        </div>
        <div className="flex justify-center items-center py-6">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!miningInfo) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="text-yellow-500" size={18} />
          <span className="font-medium">Награды за майнинг</span>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-4 text-center text-gray-400">Информация о наградах недоступна</div>
      </div>
    )
  }

  const { rewards, total_hashrate, config } = miningInfo
  const canCollect = rewards?.can_collect || false
  const rewardAmount = Number.parseFloat(rewards?.amount || 0)
  const hourlyRate = Number.parseFloat(rewards?.hourly_rate || 0)
  const timeUntilCollection = Number.parseInt(rewards?.time_until_collection || 0)
  const collectionProgress = Number.parseFloat(rewards?.collection_progress || 0)
  const coinsPerHs = Number.parseFloat(config?.coins_per_hs || 0)

  return (
    <div className="bg-[#0F1729]/90 p-4 rounded-xl">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-3">
        <Coins className="text-yellow-500" size={18} />
        <span className="font-medium">Награды за майнинг</span>
      </div>

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-950/30 border border-green-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-green-500/90">{success}</div>
          </div>
        </div>
      )}

      {/* Основная информация */}
      <div className="bg-[#1A2234] rounded-lg p-4 mb-3">
        <div className="flex flex-col items-center">
          <div className="text-gray-400 text-sm mb-1">Добыто монет</div>
          <div className="text-2xl font-bold mb-2">{formatNumber(rewardAmount, 2)} 💎</div>

          <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, collectionProgress)}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
            <Clock size={14} />
            <span>{canCollect ? "Можно собрать сейчас" : `До сбора: ${formatTime(timeUntilCollection)}`}</span>
          </div>

          <div className="text-sm text-gray-400 mb-1">Скорость майнинга</div>
          <div className="text-lg font-medium">{formatNumber(hourlyRate, 2)} 💎/час</div>

          <div className="text-xs text-gray-500 mt-2">
            Хешрейт: {formatNumber(total_hashrate)} H/s × {formatNumber(coinsPerHs, 6)} 💎 ={" "}
            {formatNumber(hourlyRate, 2)} 💎/час
          </div>
        </div>
      </div>

      {/* Кнопка сбора */}
      <button
        onClick={collectRewards}
        disabled={!canCollect || collecting || rewardAmount <= 0}
        className={`
          w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
          ${
            canCollect && rewardAmount > 0 && !collecting
              ? "bg-yellow-500 hover:bg-yellow-400 text-black"
              : "bg-gray-800 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {collecting ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin"></div>
            <span>Сбор наград...</span>
          </>
        ) : (
          <>
            <ArrowDown size={18} />
            <span>Собрать награды</span>
          </>
        )}
      </button>
    </div>
  )
}

export default MiningRewards

