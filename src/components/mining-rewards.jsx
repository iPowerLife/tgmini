"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2, Cpu, Zap, Calendar, Wallet, Play } from "lucide-react"

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
  const lastUpdateRef = useRef(null)

  // Функция для запуска майнинга
  const startMining = async () => {
    try {
      console.log("Запуск майнинга")
      setLoading(true)

      // Вызываем функцию start_mining
      const { data, error } = await supabase.rpc("start_mining", {
        user_id_param: userId,
        duration_seconds: miningDuration,
      })

      if (error) throw error

      console.log("Майнинг запущен:", data)

      // Обновляем состояние
      setIsMining(true)
      setCanCollect(false)
      setFrozenAmount(null)
      setCurrentAmount(0)
      setTimeUntilCollection(miningDuration)

      // Сбрасываем время последнего обновления
      lastUpdateRef.current = null

      // Обновляем данные
      await loadData()
    } catch (err) {
      console.error("Ошибка при запуске майнинга:", err)
      setError("Не удалось запустить майнинг")
    } finally {
      setLoading(false)
    }
  }

  // Функция для остановки майнинга
  const stopMining = async () => {
    try {
      console.log("Остановка майнинга")
      setLoading(true)

      // Обновляем состояние в базе данных
      const { data, error } = await supabase
        .from("mining_state")
        .update({
          is_mining: false,
          frozen_amount: currentAmount,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      console.log("Майнинг остановлен")

      // Обновляем состояние
      setIsMining(false)
      setCanCollect(true)
      setFrozenAmount(currentAmount)
      setTimeUntilCollection(0)

      // Обновляем данные
      await loadData()
    } catch (err) {
      console.error("Ошибка при остановке майнинга:", err)
      setError("Не удалось остановить майнинг")
    } finally {
      setLoading(false)
    }
  }

  // Функция загрузки данных
  const loadData = async () => {
    if (!userId) return

    try {
      setError(null)
      setShowError(false)

      // Получаем информацию о майнинге
      const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Mining info data:", data)

      // Обновляем состояние только если компонент все еще смонтирован
      if (isComponentMounted.current) {
        setMiningInfo(data)

        // Устанавливаем состояние на основе данных
        if (data?.mining_state) {
          const { is_mining, current_amount, frozen_amount, remaining_seconds } = data.mining_state

          setIsMining(is_mining)
          setCanCollect(!is_mining)

          if (is_mining) {
            // Если майнинг активен
            setCurrentAmount(current_amount || 0)
            setFrozenAmount(null)
            setTimeUntilCollection(remaining_seconds || 0)
          } else {
            // Если майнинг остановлен
            setCurrentAmount(frozen_amount || 0)
            setFrozenAmount(frozen_amount || 0)
            setTimeUntilCollection(0)
          }
        }

        // Получаем интервал сбора из конфигурации
        if (data?.config?.mining_duration_seconds) {
          setMiningDuration(data.config.mining_duration_seconds)
        }
      }
    } catch (err) {
      console.error("Error loading mining info:", err)
      if (isComponentMounted.current) {
        setError("Ошибка при загрузке данных майнинга")
      }
    }
  }

  // Загрузка данных при монтировании
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true
    loadData()

    return () => {
      isComponentMounted.current = false
      if (mainIntervalRef.current) {
        clearInterval(mainIntervalRef.current)
      }
    }
  }, [userId, initialData])

  // Основной интервал для всех расчетов
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (mainIntervalRef.current) {
      clearInterval(mainIntervalRef.current)
    }

    // Запускаем новый интервал
    mainIntervalRef.current = setInterval(async () => {
      // Если майнинг не активен или сумма заморожена, ничего не делаем
      if (!isMining || frozenAmount !== null) {
        return
      }

      // Обновляем таймер
      setTimeUntilCollection((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          // Когда таймер достигает нуля, останавливаем майнинг
          stopMining()
          return 0
        }
        return newTime
      })

      // Обновляем сумму только если майнинг активен
      if (isMining && miningInfo?.rewards?.hourly_rate) {
        setCurrentAmount((prev) => {
          // Рассчитываем прирост за 1 секунду (часовая ставка / 3600)
          const increment = miningInfo.rewards.hourly_rate / 3600
          const newAmount = prev + increment

          // Обновляем отображаемую сумму
          setMiningInfo((prevInfo) => ({
            ...prevInfo,
            rewards: {
              ...prevInfo.rewards,
              amount: newAmount,
            },
          }))

          return newAmount
        })
      }

      // Обновляем данные с сервера каждые 5 секунд
      const now = Date.now()
      if (!lastUpdateRef.current || now - lastUpdateRef.current >= 5000) {
        await loadData()
        lastUpdateRef.current = now
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
      } else {
        setError(data.error || "Не удалось собрать награды")
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      setError("Ошибка при сборе наград")
    } finally {
      setCollecting(false)
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
                    isMining ? Math.floor((1 - timeUntilCollection / miningDuration) * 100) : canCollect ? 100 : 0
                  }%`,
                  transition: "width 1s linear",
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Кнопка сбора наград или запуска майнинга */}
            <button
              onClick={displayAmount <= 0 ? startMining : handleMiningAction}
              disabled={(!canCollect && displayAmount > 0) || collecting}
              className={`
                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                ${
                  (!canCollect && displayAmount > 0) || collecting
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
              ) : displayAmount <= 0 ? (
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

