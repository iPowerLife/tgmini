"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, Cpu, Zap, Wallet, Play, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const MiningRewards = ({ userId, onBalanceUpdate }) => {
  // Основные состояния
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMiner, setHasMiner] = useState(false)

  // Состояния майнинга
  const [miningState, setMiningState] = useState({
    isMining: false,
    amount: 0,
    remainingSeconds: 0,
    canCollect: false,
    hashrate: 0,
    hourlyRate: 0,
    poolName: "Стандартный",
    poolMultiplier: 1,
    poolFee: 0,
  })

  // Состояние для кнопок
  const [collecting, setCollecting] = useState(false)
  const [starting, setStarting] = useState(false)

  // Ref для таймера и проверки монтирования
  const timerRef = useRef(null)
  const updateTimerRef = useRef(null)
  const mountedRef = useRef(true)
  const navigate = useNavigate()

  // Функция для форматирования чисел
  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00"
    return Math.max(0, Number(num)).toFixed(decimals)
  }

  // Функция для форматирования времени
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Функция для получения данных о майнинге
  const fetchMiningData = async () => {
    if (!userId) return

    try {
      console.log("Загрузка данных майнинга...")

      const { data, error } = await supabase.rpc("get_mining_info", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Данные майнинга получены:", data)

      if (!mountedRef.current) return

      // Проверяем, есть ли у пользователя майнеры
      setHasMiner(data.user_has_miners)

      // Обновляем состояние из полученных данных
      setMiningState({
        isMining: data.mining_state.is_mining,
        amount: data.mining_state.is_mining ? data.mining_state.current_amount : data.mining_state.frozen_amount,
        remainingSeconds: data.mining_state.remaining_seconds || 0,
        canCollect: !data.mining_state.is_mining && data.mining_state.frozen_amount > 0,
        hashrate: data.total_hashrate || 0,
        hourlyRate: data.rewards.hourly_rate || 0,
        poolName: data.pool.display_name || data.pool.name,
        poolMultiplier: data.pool.multiplier,
        poolFee: data.pool.fee_percent,
      })

      // Если майнинг активен, запускаем таймер
      if (data.mining_state.is_mining) {
        startLocalTimer(data.mining_state.remaining_seconds, data.rewards.hourly_rate)
      }

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при загрузке данных майнинга:", err)
      if (mountedRef.current) {
        setError("Не удалось загрузить данные майнинга")
        setLoading(false)
      }
    }
  }

  // Функция для запуска локального таймера
  const startLocalTimer = (seconds, rate) => {
    // Очищаем предыдущий таймер
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Запускаем новый таймер
    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return

      setMiningState((prev) => {
        // Если таймер закончился
        if (prev.remainingSeconds <= 1) {
          clearInterval(timerRef.current)

          // Обновляем состояние на сервере
          updateMiningState()

          return {
            ...prev,
            isMining: false,
            canCollect: true,
            remainingSeconds: 0,
          }
        }

        // Обновляем время и сумму
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
          amount: prev.isMining ? prev.amount + rate / 3600 : prev.amount,
        }
      })
    }, 1000)
  }

  // Функция для обновления состояния майнинга на сервере
  const updateMiningState = async () => {
    try {
      const { data, error } = await supabase.rpc("update_mining_state", {
        user_id_param: userId,
      })

      if (error) throw error

      console.log("Состояние майнинга обновлено:", data)

      // Обновляем локальное состояние
      fetchMiningData()
    } catch (err) {
      console.error("Ошибка при обновлении состояния майнинга:", err)
    }
  }

  // Функция для запуска майнинга
  const startMining = async () => {
    try {
      setStarting(true)
      setError(null)

      const { data, error } = await supabase.rpc("start_mining", {
        user_id_param: userId,
      })

      if (error) throw error

      if (!data.success) {
        setError(data.error)
        setStarting(false)
        return
      }

      console.log("Майнинг запущен:", data)

      // Обновляем данные с сервера
      await fetchMiningData()
      setStarting(false)
    } catch (err) {
      console.error("Ошибка при запуске майнинга:", err)
      setError("Не удалось запустить майнинг")
      setStarting(false)
    }
  }

  // Функция для сбора наград
  const collectRewards = async () => {
    if (!miningState.canCollect || collecting) return

    try {
      setCollecting(true)
      setError(null)

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
      })

      if (error) throw error

      if (!data.success) {
        setError(data.error)
        setCollecting(false)
        return
      }

      console.log("Награды собраны:", data)

      // Обновляем баланс в родительском компоненте
      if (onBalanceUpdate && typeof onBalanceUpdate === "function") {
        onBalanceUpdate(data.new_balance)
      }

      // Показываем уведомление о собранной награде
      const rewardAmount = data.amount
      alert(`Вы получили ${formatNumber(rewardAmount)} 💎!`)

      // Автоматически запускаем майнинг снова
      await startMining()
      setCollecting(false)
    } catch (err) {
      console.error("Ошибка при сборе наград:", err)
      setError("Ошибка при сборе наград")
      setCollecting(false)
    }
  }

  // Функция для перехода в магазин
  const goToShop = () => {
    navigate("/shop")
  }

  // Инициализация при монтировании
  useEffect(() => {
    mountedRef.current = true

    // Загружаем начальные данные
    fetchMiningData()

    // Настраиваем интервал для периодического обновления данных с сервера
    updateTimerRef.current = setInterval(() => {
      if (mountedRef.current) {
        updateMiningState()
      }
    }, 30000) // Обновляем каждые 30 секунд

    return () => {
      mountedRef.current = false

      // Очищаем интервалы при размонтировании
      if (timerRef.current) clearInterval(timerRef.current)
      if (updateTimerRef.current) clearInterval(updateTimerRef.current)
    }
  }, [userId])

  // Расчет процента прогресса
  const getProgressPercent = () => {
    const { isMining, remainingSeconds, canCollect } = miningState

    if (!isMining) return canCollect ? 100 : 0

    // Получаем продолжительность майнинга из конфигурации
    // Предполагаем, что это 60 секунд (1 минута) по умолчанию
    const duration = 60

    return Math.floor((1 - remainingSeconds / duration) * 100)
  }

  // Расчет дневного дохода
  const getDailyIncome = () => {
    return miningState.hourlyRate * 24
  }

  // Если данные загружаются
  if (loading) {
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

  // Если у пользователя нет майнеров
  if (!hasMiner) {
    return (
      <div className="bg-[#151B26] p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-500" size={18} />
            <span className="font-medium">Майнинг</span>
          </div>
        </div>

        <div className="bg-[#1A2234] rounded-xl overflow-hidden mb-3">
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">У вас нет майнеров</h3>
            <p className="text-gray-400 mb-4">
              Для начала майнинга вам необходимо приобрести хотя бы один майнер в магазине.
            </p>
            <button
              onClick={goToShop}
              className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              <ShoppingCart size={18} />
              <span>Перейти в магазин</span>
            </button>
          </div>
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
          <span className="text-gray-400">Пул: {miningState.poolName}</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">{miningState.poolMultiplier}x</span>
            <span className="text-gray-400">{miningState.poolFee}%</span>
          </div>
        </div>
      </div>

      {/* Сообщения об ошибках */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
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
              <span className="font-medium text-white">{formatNumber(miningState.amount)}</span>
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
              <span className="font-medium text-white">{formatNumber(miningState.hashrate)}</span>
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
              <span className={`font-medium ${miningState.canCollect ? "text-green-400" : "text-white"}`}>
                {formatTime(miningState.remainingSeconds)}
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
                  {miningState.isMining
                    ? "Майнинг активен"
                    : miningState.canCollect
                      ? "Можно собрать награды"
                      : "Майнинг остановлен"}
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
              onClick={miningState.canCollect ? collectRewards : startMining}
              disabled={miningState.isMining || collecting || starting}
              className={`
                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                ${
                  miningState.isMining || collecting || starting
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
              ) : starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Запуск майнинга...</span>
                </>
              ) : miningState.isMining ? (
                <>
                  <Play size={18} className="animate-pulse" />
                  <span>Майнинг</span>
                </>
              ) : miningState.canCollect ? (
                <>
                  <ArrowDown size={18} />
                  <span>Собрать награды</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Запуск майнинга</span>
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

