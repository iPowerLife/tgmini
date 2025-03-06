"use client"

import { useState, useEffect } from "react"
import { Clock, Coins, ChevronRight, Loader, AlertCircle, Database } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewards = ({ userId, onCollect }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

  // Загрузка информации о майнинге
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

        setMiningInfo(data)

        // Устанавливаем таймер до следующего сбора
        if (data.time_until_next_collection > 0) {
          setTimeLeft(data.time_until_next_collection * 1000)
        } else {
          setTimeLeft(0)
        }
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных о майнинге")
      } finally {
        setLoading(false)
      }
    }

    loadMiningInfo()

    // Обновляем данные каждые 5 минут
    const interval = setInterval(loadMiningInfo, 5 * 60 * 1000)

    // Обновляем таймер каждую секунду
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 1000 ? prev - 1000 : 0))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [userId])

  // Форматирование времени
  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }

  // Сбор наград
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
        // Обновляем баланс
        onCollect(data.new_balance)

        // Устанавливаем таймер до следующего сбора
        setTimeLeft(4 * 60 * 60 * 1000) // 4 часа

        // Обновляем информацию о майнинге
        const { data: miningData } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (miningData) {
          setMiningInfo(miningData)
        }

        // Показываем уведомление об успешном сборе
        alert(`Успешно собрано ${data.amount} монет!`)
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

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={18} />
            <span className="font-medium">Сбор наград</span>
          </div>
        </div>
        <div className="flex justify-center items-center py-6">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    )
  }

  // Если нет майнеров, показываем сообщение
  if (!miningInfo || !miningInfo.miners || miningInfo.miners.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={18} />
            <span className="font-medium">Сбор наград</span>
          </div>
        </div>
        <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-blue-500/90">
              У вас пока нет майнеров. Приобретите майнеры в магазине, чтобы начать добывать монеты.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Coins className="text-yellow-500" size={18} />
          <span className="font-medium">Сбор наград</span>
        </div>

        {timeLeft > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Clock size={14} className="text-orange-400" />
            <span className="text-orange-400">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Информация о пуле */}
      <div className="bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Database size={14} className="text-blue-400" />
          <span className="text-sm font-medium">Пул: {miningInfo.pool?.display_name || "Стандартный"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            Множитель: <span className="text-blue-400">{miningInfo.pool?.multiplier || 1.0}x</span>
          </div>
          <div>
            Комиссия: <span className="text-blue-400">{miningInfo.pool?.fee_percent || 5}%</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {miningInfo.rewards &&
          miningInfo.rewards.map((reward) => (
            <div key={reward.period} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">За {reward.period} часов:</div>
                  <div className="text-lg font-semibold">{reward.amount} 💎</div>
                </div>
                <button
                  onClick={() => handleCollect(reward.period)}
                  disabled={collecting || timeLeft > 0}
                  className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                  ${
                    collecting
                      ? "bg-gray-700 text-gray-400 cursor-wait"
                      : timeLeft > 0
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:shadow-md"
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
          ))}
      </div>
    </div>
  )
}

export default MiningRewards

