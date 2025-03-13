"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2, Cpu, Zap, Calendar, Wallet } from "lucide-react"

export const MiningRewards = ({ userId, initialData, onBalanceUpdate }) => {
  const [loading, setLoading] = useState(!initialData)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(initialData || null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentAmount, setCurrentAmount] = useState(0)
  const [isMining, setIsMining] = useState(false)
  const [timeUntilCollection, setTimeUntilCollection] = useState(0)
  const [canCollect, setCanCollect] = useState(false)
  const [showError, setShowError] = useState(false)
  const [miningDuration, setMiningDuration] = useState(60) // 1 минута для тестирования
  const [frozenAmount, setFrozenAmount] = useState(null)

  // Один интервал для всех операций
  const mainIntervalRef = useRef(null)
  const isComponentMounted = useRef(true)

  // Функция для сохранения состояния майнинга
  const saveMiningState = async (isMining, amount) => {
    try {
      console.log("Сохранение состояния майнинга:", { isMining, amount })

      const { data, error } = await supabase.rpc("save_mining_state", {
        user_id_param: userId,
        is_mining_param: isMining,
        frozen_amount_param: amount,
      })

      if (error) {
        console.error("Ошибка при сохранении состояния майнинга:", error)
        throw error
      }

      console.log("Состояние майнинга сохранено:", data)
      return data
    } catch (err) {
      console.error("Ошибка в saveMiningState:", err)
      return null
    }
  }

  // Функция для получения состояния майнинга
  const getMiningState = async () => {
    try {
      const { data, error } = await supabase.rpc("get_mining_state", {
        user_id_param: userId,
      })

      if (error) {
        console.error("Ошибка при получении состояния майнинга:", error)
        throw error
      }

      console.log("Получено состояние майнинга:", data)
      return data
    } catch (err) {
      console.error("Ошибка в getMiningState:", err)
      return null
    }
  }

  // Функция для запуска майнинга
  const startMining = async () => {
    console.log("Запуск майнинга")

    // Сбрасываем счетчики
    setCurrentAmount(0)
    setFrozenAmount(null)
    setCanCollect(false)

    // Устанавливаем флаг майнинга
    setIsMining(true)

    // Устанавливаем таймер
    setTimeUntilCollection(miningDuration)

    // Сохраняем состояние в базе данных
    await saveMiningState(true, 0)
  }

  // Функция для остановки майнинга
  const stopMining = async () => {
    console.log("Остановка майнинга")

    // Фиксируем сумму
    const finalAmount = currentAmount
    setFrozenAmount(finalAmount)

    // Сбрасываем флаг майнинга
    setIsMining(false)

    // Разрешаем сбор наград
    setCanCollect(true)

    // Устанавливаем таймер в 0
    setTimeUntilCollection(0)

    // Сохраняем состояние в базе данных
    await saveMiningState(false, finalAmount)
  }

  // Загрузка данных
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true

    const loadData = async () => {
      if (!initialData) {
        setLoading(true)
      }

      try {
        setError(null)
        setShowError(false)

        // Получаем состояние майнинга из базы данных
        const miningState = await getMiningState()

        // Получаем информацию о майнинге
        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        })

        if (!isComponentMounted.current) return

        if (error) throw error

        console.log("Mining info data:", data)
        setMiningInfo(data)

        // Устанавливаем состояние на основе данных из базы
        if (miningState) {
          if (miningState.is_mining) {
            // Если майнинг активен
            setIsMining(true)
            setCanCollect(false)
            setFrozenAmount(null)

            // Устанавливаем начальную сумму
            if (data?.rewards?.amount) {
              setCurrentAmount(data.rewards.amount)
            }

            // Устанавливаем таймер
            if (data?.rewards?.time_until_collection) {
              setTimeUntilCollection(data.rewards.time_until_collection)
            } else {
              setTimeUntilCollection(miningDuration)
            }
          } else {
            // Если майнинг остановлен
            setIsMining(false)
            setCanCollect(true)
            setFrozenAmount(miningState.frozen_amount)
            setCurrentAmount(miningState.frozen_amount)
            setTimeUntilCollection(0)
          }
        } else {
          // Если нет данных о состоянии, используем данные из API
          if (data?.rewards) {
            setCurrentAmount(data.rewards.amount || 0)

            const timeUntil = data.rewards.time_until_collection || 0
            setTimeUntilCollection(timeUntil)

            // Можно собрать, если время вышло или разрешен сбор в любое время
            const canCollectNow = timeUntil <= 0 || data.rewards.allow_anytime_collection
            setCanCollect(canCollectNow)

            // Майнинг активен, если нельзя собрать награды
            setIsMining(!canCollectNow)

            // Если майнинг остановлен, фиксируем сумму
            if (canCollectNow) {
              setFrozenAmount(data.rewards.amount || 0)
            }
          }
        }

        // Получаем интервал сбора из конфигурации
        if (data?.config?.collection_interval_hours) {
          const intervalInSeconds = data.config.collection_interval_hours * 3600
          setMiningDuration(intervalInSeconds)
        }
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

    return () => {
      isComponentMounted.current = false
      if (mainIntervalRef.current) {
        clearInterval(mainIntervalRef.current)
      }
    }
  }, [userId, initialData, miningDuration])

  // Основной интервал для всех расчетов
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (mainIntervalRef.current) {
      clearInterval(mainIntervalRef.current)
    }

    // Запускаем новый интервал
    mainIntervalRef.current = setInterval(() => {
      // Если майнинг не активен или сумма заморожена, ничего не делаем
      if (!isMining || frozenAmount !== null) {
        return
      }

      // Обновляем таймер
      setTimeUntilCollection((prev) => {
        if (prev <= 1) {
          // Когда таймер достигает нуля, останавливаем майнинг
          stopMining()
          return 0
        }
        return prev - 1
      })

      // Обновляем сумму только если майнинг активен
      if (isMining && miningInfo?.rewards?.hourly_rate) {
        setCurrentAmount((prev) => {
          // Рассчитываем прирост за 1 секунду (часовая ставка / 3600)
          const increment = miningInfo.rewards.hourly_rate / 3600
          return prev + increment
        })
      }
    }, 1000)

    return () => {
      if (mainIntervalRef.current) {
        clearInterval(mainIntervalRef.current)
      }
    }
  }, [isMining, frozenAmount, miningInfo?.rewards?.hourly_rate])

  // Сбор наград
  const collectRewards = async () => {
    if (collecting || !canCollect) return

    try {
      setCollecting(true)
      setError(null)
      setSuccess(null)

      // Используем замороженную сумму, если она есть
      const amountToCollect = frozenAmount !== null ? frozenAmount : currentAmount

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
      })

      if (!isComponentMounted.current) return

      if (error) throw error

      if (data.success) {
        // Показываем сообщение об успехе
        const formattedAmount = Number(amountToCollect).toFixed(2)
        setSuccess(`Вы успешно собрали ${formattedAmount} монет!`)

        // Запускаем майнинг заново
        await startMining()

        // Обновляем баланс в родительском компоненте
        if (onBalanceUpdate && data.new_balance !== undefined) {
          onBalanceUpdate(data.new_balance)
        }

        // Обновляем данные
        const { data: updatedData } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        })

        if (updatedData) {
          setMiningInfo(updatedData)
        }
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

  // Обработчик кнопки
  const handleMiningAction = async () => {
    if (!canCollect) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    if (collecting) return

    try {
      await collectRewards()
    } catch (err) {
      console.error("Error in handleMiningAction:", err)
    }
  }

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00"
    // Убеждаемся, что число не отрицательное
    const positiveNum = Math.max(0, Number(num))
    return positiveNum.toFixed(decimals)
  }

  // Обновленная функция форматирования времени (без миллисекунд)
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Определяем отображаемую сумму
  const displayAmount = frozenAmount !== null ? frozenAmount : currentAmount

  if (!miningInfo) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Майнинг</span>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-4 text-center text-gray-400">Информация о майнинге недоступна</div>
      </div>
    )
  }

  const { rewards, total_hashrate, pool, config } = miningInfo
  const hourlyRate = Number.parseFloat(rewards?.hourly_rate || 0)
  const dailyIncome = hourlyRate * 24
  const daysInMining = 1

  return (
    <div className="bg-[#151B26] p-4 rounded-xl mb-4">
      {/* Заголовок с информацией о пуле */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Майнинг</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Пул: {pool?.display_name || "Стандартный"}</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">{pool?.multiplier || 1}x</span>
            <span className="text-gray-400">{pool?.fee_percent || 5}%</span>
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

      {/* Показываем сообщение об ошибке, если слишком рано для сбора */}
      {showError && !canCollect && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">Слишком рано для сбора наград</div>
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
              <span className="font-medium text-white">{formatNumber(displayAmount)}</span>
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
              <span className="font-medium text-white">{formatNumber(dailyIncome)}</span>
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
              <span className="font-medium text-white">{formatNumber(total_hashrate)}</span>
              <span className="text-blue-400">H/s</span>
            </div>
          </div>

          {/* Дней в майнинге */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} className="text-blue-400" />
              <span>Дней в майнинге:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">{daysInMining}</span>
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
                {formatTime(timeUntilCollection)}
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
              <div className="text-sm text-gray-400">
                {isMining ? `${Math.floor((timeUntilCollection / miningDuration) * 100)}%` : canCollect ? "100%" : "0%"}
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 relative"
                style={{
                  width: `${
                    isMining ? Math.floor((timeUntilCollection / miningDuration) * 100) : canCollect ? 100 : 0
                  }%`,
                  transition: "width 1s linear",
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Кнопка сбора наград */}
            <button
              onClick={handleMiningAction}
              disabled={!canCollect || collecting}
              className={`
                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                ${
                  !canCollect || collecting
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

