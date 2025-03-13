"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2, Cpu, Zap, Calendar, Wallet, Play } from "lucide-react"

export const MiningRewards = ({ userId, initialData, onBalanceUpdate }) => {
  const [loading, setLoading] = useState(!initialData)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(initialData || null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentAmount, setCurrentAmount] = useState(0)
  const [isMining, setIsMining] = useState(true) // По умолчанию майнинг активен
  const [miningTimeLeft, setMiningTimeLeft] = useState(0)
  const [miningDuration, setMiningDuration] = useState(60) // 1 минута в секундах для тестирования
  const lastUpdateRef = useRef(null)
  const hourlyRateRef = useRef(0)
  const baseAmountRef = useRef(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const intervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const isComponentMounted = useRef(true)

  // Функция для расчета текущего количества монет
  const calculateCurrentAmount = useCallback(() => {
    if (!miningInfo?.rewards) return 0

    const now = Date.now()
    const lastUpdate = new Date(miningInfo.rewards.last_update).getTime()
    const hourlyRate = miningInfo.rewards.hourly_rate
    const baseAmount = miningInfo.rewards.base_amount || 0 // Добавляем значение по умолчанию

    // Рассчитываем время с последнего обновления в часах
    const hoursSinceUpdate = Math.max(0, (now - lastUpdate) / (1000 * 3600))

    // Рассчитываем текущую сумму и убеждаемся, что она не отрицательная
    const amount = baseAmount + hourlyRate * hoursSinceUpdate
    return Math.max(0, amount)
  }, [miningInfo])

  // Обновляем текущую сумму каждую секунду
  useEffect(() => {
    if (!miningInfo?.rewards) return

    // Сохраняем значения в refs для доступа в интервале
    lastUpdateRef.current = new Date(miningInfo.rewards.last_update).getTime()
    hourlyRateRef.current = miningInfo.rewards.hourly_rate
    baseAmountRef.current = miningInfo.rewards.base_amount

    // Устанавливаем начальное значение
    setCurrentAmount(calculateCurrentAmount())

    // Обновляем значение каждую секунду
    const interval = setInterval(() => {
      setCurrentAmount(calculateCurrentAmount())
    }, 1000)

    return () => clearInterval(interval)
  }, [miningInfo, calculateCurrentAmount])

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

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        })

        if (!isComponentMounted.current) return

        if (error) throw error

        console.log("Mining info data:", data)
        setMiningInfo(data)

        // Получаем интервал сбора из конфигурации
        if (data?.config?.collection_interval_hours) {
          // Преобразуем часы в секунды
          const intervalInSeconds = data.config.collection_interval_hours * 3600
          setMiningDuration(intervalInSeconds)
          // Запускаем таймер майнинга при загрузке данных
          startMiningTimer(intervalInSeconds)
        } else {
          // Если нет данных, используем значение по умолчанию (1 минута для тестирования)
          startMiningTimer(60)
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [userId, lastUpdate, initialData])

  // Функция для запуска таймера майнинга
  const startMiningTimer = (duration) => {
    // Очищаем предыдущий таймер, если он был
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    setIsMining(true)
    setMiningTimeLeft(duration)

    // Запускаем таймер
    timerIntervalRef.current = setInterval(() => {
      setMiningTimeLeft((prev) => {
        if (prev <= 1) {
          // Останавливаем майнинг, когда время истекло
          clearInterval(timerIntervalRef.current)
          setIsMining(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Сбор наград и перезапуск майнинга
  const handleMiningAction = async () => {
    // Если майнинг активен или идет сбор наград, ничего не делаем
    if (isMining || collecting) return

    // Если майнинг остановлен и есть награды для сбора
    if (!isMining && currentAmount > 0) {
      await collectRewards()
    }
    // Если майнинг остановлен и нет наград или награды уже собраны
    else if (!isMining) {
      // Запускаем майнинг снова
      startMiningTimer(miningDuration)
    }
  }

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
        // Показываем сообщение об успехе с округлением до 2 знаков
        const formattedAmount = Number(data.amount).toFixed(2)
        setSuccess(`Вы успешно собрали ${formattedAmount} монет!`)

        // Сразу устанавливаем currentAmount в 0, чтобы избежать отрицательных значений
        setCurrentAmount(0)

        // Обновляем данные после сбора
        setLastUpdate(Date.now())

        // Обновляем баланс в родительском компоненте
        if (onBalanceUpdate && data.new_balance !== undefined) {
          onBalanceUpdate(data.new_balance)
        }

        // Получаем обновленные данные о майнинге
        const { data: updatedData } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: userId,
        })

        if (updatedData) {
          // Устанавливаем новые данные с обнуленным начальным значением
          setMiningInfo({
            ...updatedData,
            rewards: {
              ...updatedData.rewards,
              amount: 0,
              base_amount: 0,
            },
          })
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

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00"
    // Убеждаемся, что число не отрицательное
    const positiveNum = Math.max(0, Number(num))
    return positiveNum.toFixed(decimals)
  }

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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
  const canCollect = rewards?.can_collect || false
  const rewardAmount = Number.parseFloat(rewards?.amount || 0)
  const hourlyRate = Number.parseFloat(rewards?.hourly_rate || 0)
  const timeUntilCollection = Number.parseInt(rewards?.time_until_collection || 0)
  const collectionProgress = Number.parseFloat(rewards?.collection_progress || 0)
  const collectionIntervalHours = rewards?.collection_interval_hours || config?.collection_interval_hours || 1
  const allowAnytimeCollection = rewards?.allow_anytime_collection || config?.allow_anytime_collection || false

  // Рассчитываем средний доход в день
  const dailyIncome = hourlyRate * 24

  // Получаем количество дней в майнинге (пока заглушка)
  const daysInMining = 1

  // Определяем, можно ли собрать награды
  // Теперь можно собрать награды, если майнинг остановлен (время истекло) или если разрешен сбор в любое время
  const canCollectNow = (miningTimeLeft === 0 || allowAnytimeCollection) && rewardAmount > 0

  // Определяем текст и стиль кнопки в зависимости от состояния
  let buttonText = "Собрать награды"
  let buttonIcon = <ArrowDown size={18} />
  let buttonClass =
    "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white shadow-lg shadow-blue-500/20"
  let isButtonDisabled = false

  if (collecting) {
    buttonText = "Сбор наград..."
    buttonIcon = <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    isButtonDisabled = true
  } else if (isMining) {
    buttonText = "Майнинг активен"
    buttonClass = "bg-gray-800 text-gray-400 cursor-not-allowed"
    isButtonDisabled = true
  } else if (miningTimeLeft === 0 && currentAmount <= 0) {
    buttonText = "Запустить майнинг"
    buttonIcon = <Play size={18} />
    buttonClass =
      "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white shadow-lg shadow-green-500/20"
  } else if (miningTimeLeft === 0 && currentAmount > 0) {
    buttonText = "Собрать награды"
    buttonIcon = <ArrowDown size={18} />
  } else {
    isButtonDisabled = true
  }

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
              <span className="font-medium text-white">{formatNumber(currentAmount)}</span>
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
              <span>Время майнинга:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`font-medium ${isMining ? "text-green-400" : "text-white"}`}>
                {formatTime(miningTimeLeft)}
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
                  {miningTimeLeft === 0 ? "Майнинг остановлен" : isMining ? "Майнинг активен" : "Майнинг не запущен"}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {isMining ? `${Math.floor((miningTimeLeft / miningDuration) * 100)}%` : "0%"}
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 relative"
                style={{
                  width: `${isMining ? Math.floor((miningTimeLeft / miningDuration) * 100) : 0}%`,
                  transition: "width 1s linear",
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Кнопка сбора наград / запуска майнинга */}
            <button
              onClick={handleMiningAction}
              disabled={isButtonDisabled}
              className={`
              w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
              ${isButtonDisabled ? "bg-gray-800 text-gray-400 cursor-not-allowed" : buttonClass}
            `}
            >
              {buttonIcon}
              <span>{buttonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiningRewards

