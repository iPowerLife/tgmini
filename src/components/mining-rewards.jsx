"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2, Cpu, Zap, Wallet, Play } from "lucide-react"

export const MiningRewards = ({ userId, initialData, onBalanceUpdate }) => {
  // Основные состояния
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Состояния майнинга
  const [isMining, setIsMining] = useState(false)
  const [miningAmount, setMiningAmount] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const [canCollect, setCanCollect] = useState(false)
  const [miningDuration, setMiningDuration] = useState(60)
  const [hashrate, setHashrate] = useState(0)
  const [hourlyRate, setHourlyRate] = useState(0)

  // Refs для интервалов и проверки монтирования
  const timerIntervalRef = useRef(null)
  const updateIntervalRef = useRef(null)
  const isMountedRef = useRef(true)

  // Загрузка данных с сервера
  const fetchMiningData = async () => {
    if (!userId) return

    try {
      console.log("Загрузка данных майнинга...")

      const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Данные майнинга получены:", data)

      if (!isMountedRef.current) return

      // Обновляем состояния из полученных данных
      if (data.mining_state) {
        setIsMining(data.mining_state.is_mining)
        setMiningAmount(
          data.mining_state.is_mining ? data.mining_state.current_amount : data.mining_state.frozen_amount,
        )
        setRemainingTime(data.mining_state.remaining_seconds || 0)
        setCanCollect(!data.mining_state.is_mining && data.mining_state.frozen_amount > 0)
      }

      if (data.config) {
        setMiningDuration(data.config.mining_duration_seconds || 60)
      }

      if (data.total_hashrate) {
        setHashrate(data.total_hashrate)
      }

      if (data.rewards) {
        setHourlyRate(data.rewards.hourly_rate || 0)
      }

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при загрузке данных майнинга:", err)
      if (isMountedRef.current) {
        setError("Не удалось загрузить данные майнинга")
        setLoading(false)
      }
    }
  }

  // Запуск майнинга
  const startMining = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.rpc("start_mining", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Майнинг запущен:", data)

      // Обновляем локальные состояния
      setIsMining(true)
      setMiningAmount(0)
      setRemainingTime(data.duration_seconds || miningDuration)
      setCanCollect(false)

      // Запускаем таймер
      startTimer()

      // Обновляем данные с сервера
      await fetchMiningData()
    } catch (err) {
      console.error("Ошибка при запуске майнинга:", err)
      setError("Не удалось запустить майнинг")
    } finally {
      setLoading(false)
    }
  }

  // Сбор наград
  const collectRewards = async () => {
    if (!canCollect || collecting) return

    try {
      setCollecting(true)

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Награды собраны:", data)

      if (data.success) {
        // Показываем сообщение об успехе
        setSuccess(`Вы успешно собрали ${Number(data.amount).toFixed(2)} монет!`)

        // Обновляем баланс в родительском компоненте
        if (onBalanceUpdate && typeof onBalanceUpdate === "function") {
          onBalanceUpdate(data.new_balance)
        }

        // Сбрасываем состояния
        setMiningAmount(0)
        setCanCollect(false)

        // Запускаем майнинг снова
        await startMining()
      } else {
        setError(data.error || "Не удалось собрать награды")
      }
    } catch (err) {
      console.error("Ошибка при сборе наград:", err)
      setError("Ошибка при сборе наград")
    } finally {
      setCollecting(false)
    }
  }

  // Запуск таймера для обновления времени и суммы
  const startTimer = () => {
    // Очищаем предыдущий таймер
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    // Запускаем новый таймер
    timerIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      // Обновляем оставшееся время
      setRemainingTime((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })

      // Обновляем сумму майнинга
      if (isMining && hourlyRate > 0) {
        setMiningAmount((prev) => {
          // Увеличиваем на секундную ставку (часовая ставка / 3600)
          return prev + hourlyRate / 3600
        })
      }

      // Если время вышло, останавливаем майнинг
      if (remainingTime <= 1 && isMining) {
        setIsMining(false)
        setCanCollect(true)
        clearInterval(timerIntervalRef.current)
      }
    }, 1000)
  }

  // Инициализация при монтировании
  useEffect(() => {
    isMountedRef.current = true

    // Загружаем начальные данные
    fetchMiningData()

    // Настраиваем интервал для периодического обновления данных с сервера
    updateIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchMiningData()
      }
    }, 10000) // Обновляем каждые 10 секунд

    return () => {
      isMountedRef.current = false

      // Очищаем интервалы при размонтировании
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    }
  }, [userId])

  // Запускаем таймер, когда майнинг активен
  useEffect(() => {
    if (isMining) {
      startTimer()
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isMining, hourlyRate])

  // Форматирование чисел
  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00"
    return Math.max(0, Number(num)).toFixed(decimals)
  }

  // Форматирование времени
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Расчет процента прогресса
  const getProgressPercent = () => {
    if (!isMining) return canCollect ? 100 : 0
    return Math.floor((1 - remainingTime / miningDuration) * 100)
  }

  // Расчет дневного дохода
  const getDailyIncome = () => {
    return hourlyRate * 24
  }

  // Если данные загружаются
  if (loading && !hashrate) {
    return (
      <div className="bg-[#151B26] p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Майнинг</span>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#151B26] p-4 rounded-xl mb-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Майнинг</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Пул: Стандартный</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">1x</span>
            <span className="text-gray-400">5%</span>
          </div>
        </div>
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
      <div className="bg-[#1A2234] rounded-xl overflow-hidden mb-3">
        {/* Статистика майнинга */}
        <div className="space-y-3 p-4">
          {/* Всего добыто */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Wallet size={16} className="text-green-400" />
              <span>Всего добыто:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">{formatNumber(miningAmount)}</span>
              <span className="text-blue-400">💎</span>
            </div>
          </div>

          {/* Средний доход */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Coins size={16} className="text-yellow-400" />
              <span>Средний доход:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">{formatNumber(getDailyIncome())}</span>
              <span className="text-blue-400">💎/день</span>
            </div>
          </div>

          {/* Хешрейт */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={16} className="text-purple-400" />
              <span>Хешрейт:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">{formatNumber(hashrate)}</span>
              <span className="text-blue-400">H/s</span>
            </div>
          </div>

          {/* Таймер майнинга */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} className="text-orange-400" />
              <span>Время до сбора:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`font-medium ${canCollect ? "text-green-400" : "text-white"}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Прогресс и кнопка сбора */}
        <div className="border-t border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock size={14} />
                <span>
                  {isMining ? "Майнинг активен" : canCollect ? "Можно собрать награды" : "Майнинг остановлен"}
                </span>
              </div>
              <div className="text-sm text-gray-400">{getProgressPercent()}%</div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 relative"
                style={{
                  width: `${getProgressPercent()}%`,
                  transition: "width 1s linear",
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Кнопка сбора наград или запуска майнинга */}
            <button
              onClick={miningAmount <= 0 || !canCollect ? startMining : collectRewards}
              disabled={(isMining && !canCollect) || collecting}
              className={`
                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                ${
                  (isMining && !canCollect) || collecting
                    ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white shadow-lg shadow-blue-500/20"
                }
              `}
            >
              {collecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Сбор наград...</span>
                </>
              ) : isMining ? (
                <>
                  <Play size={18} className="animate-pulse" />
                  <span>Майнинг</span>
                </>
              ) : miningAmount <= 0 || !canCollect ? (
                <>
                  <Play size={18} />
                  <span>Запуск майнинга</span>
                </>
              ) : (
                <>
                  <ArrowDown size={18} />
                  <span>Собрать награды</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiningRewards

