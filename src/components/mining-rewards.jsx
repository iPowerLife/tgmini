"use client"

import { useState, useEffect, useRef } from "react"
import { Coins } from "lucide-react"
import { supabase } from "../supabase"

export const MiningRewards = ({ userId, onCollect, balance = 0, totalHashrate = 0, poolMultiplier = 1 }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPeriodMined, setCurrentPeriodMined] = useState(0)
  const [lastCollectionTime, setLastCollectionTime] = useState(null)
  const [currentMined, setCurrentMined] = useState({ value: 0, lastUpdateTime: Date.now() })
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [syncTimeout, setSyncTimeout] = useState(null)
  const [isMiningActive, setIsMiningActive] = useState(true)
  const [systemSettings, setSystemSettings] = useState({
    collection_interval_hours: 8,
    test_mode: false,
    test_collection_interval_minutes: 1,
  })

  // Используем useRef для предотвращения утечек памяти
  const timerRef = useRef(null)
  const miningTimerRef = useRef(null)
  const syncTimeoutRef = useRef(null)
  const isComponentMounted = useRef(true)

  // Получаем актуальный интервал сбора в часах
  const getCollectionIntervalHours = () => {
    if (systemSettings.test_mode) {
      return systemSettings.test_collection_interval_minutes / 60 // конвертируем минуты в часы
    }
    return systemSettings.collection_interval_hours
  }

  // Загружаем системные настройки
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase.from("system_settings").select("*").single()

        if (error) {
          console.error("Error fetching system settings:", error)
          return
        }

        if (isComponentMounted.current && data) {
          console.log("Loaded system settings:", data)
          setSystemSettings(data)

          // Если мы в тестовом режиме и таймер уже запущен, обновляем его
          if (data.test_mode && timeLeft > 0) {
            const collectionIntervalMs = data.test_collection_interval_minutes * 60 * 1000
            setTimeLeft(collectionIntervalMs)
          }
        }
      } catch (err) {
        console.error("Error loading system settings:", err)
      }
    }
    loadSettings()
  }, [timeLeft])

  // Функция для синхронизации прогресса с базой данных
  const syncProgressRef = useRef(null)
  syncProgressRef.current = async () => {
    if (!userId || !isComponentMounted.current) return

    try {
      await supabase.rpc("update_mining_progress", {
        user_id_param: userId,
        current_mined_param: currentMined.value,
        last_update_param: new Date(lastUpdate).toISOString(),
      })
    } catch (err) {
      console.error("Error syncing progress:", err)
    }
  }

  const syncProgress = syncProgressRef.current

  // Функция загрузки данных о майнинге
  const loadMiningInfoRef = useRef(null)
  loadMiningInfoRef.current = async () => {
    if (!userId || !isComponentMounted.current) return

    try {
      setError(null)

      const { data, error } = await supabase.rpc("get_mining_info", {
        user_id_param: userId,
      })

      if (!isComponentMounted.current) return

      if (error) throw error
      if (!data) throw new Error("Данные о майнинге не найдены")

      setMiningInfo(data)

      // Устанавливаем начальные значения из базы данных
      if (data.current_mined !== undefined) {
        setCurrentMined({
          value: Number(data.current_mined) || 0,
          lastUpdateTime: data.last_update ? new Date(data.last_update).getTime() : Date.now(),
        })
      }
      if (data.last_update) {
        setLastUpdate(new Date(data.last_update).getTime())
      }

      // Проверяем, должен ли майнинг быть активным
      const canCollect = data.time_until_next_collection === 0 || data.has_miner_pass
      setIsMiningActive(!canCollect) // Инвертируем логику: если нельзя собирать, значит майнинг активен

      // Если мы в тестовом режиме, используем интервал в минутах
      const collectionIntervalHours = getCollectionIntervalHours()

      if (data.time_until_next_collection > 0) {
        // Если мы в тестовом режиме, возможно нужно скорректировать время
        if (systemSettings.test_mode) {
          // Проверяем, не превышает ли оставшееся время тестовый интервал
          const testIntervalSeconds = systemSettings.test_collection_interval_minutes * 60
          if (data.time_until_next_collection > testIntervalSeconds) {
            setTimeLeft(testIntervalSeconds * 1000)
          } else {
            setTimeLeft(data.time_until_next_collection * 1000)
          }
        } else {
          setTimeLeft(data.time_until_next_collection * 1000)
        }
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
        const minedAmount = hourlyRate * Math.min(timeSinceLastCollection, collectionIntervalHours)
        setCurrentPeriodMined(Math.round(minedAmount * 100) / 100)
      }
    } catch (err) {
      console.error("Error in loadMiningInfo:", err)
      if (isComponentMounted.current) {
        setError(err.message || "Произошла неизвестная ошибка")
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false)
      }
    }
  }

  const loadMiningInfo = loadMiningInfoRef.current

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true

    const fetchData = async () => {
      await loadMiningInfo()
    }

    fetchData()

    // Устанавливаем таймер для обратного отсчета
    timerRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        setTimeLeft((prev) => {
          const newTime = prev <= 1000 ? 0 : prev - 1000
          // Если таймер истек, останавливаем майнинг
          if (newTime === 0 && prev > 0) {
            setIsMiningActive(false)
          }
          return newTime
        })
      }
    }, 1000)

    return () => {
      isComponentMounted.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (miningTimerRef.current) clearInterval(miningTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [userId, loadMiningInfo])

  // Обновляем значение добытых монет каждую секунду и синхронизируем с базой данных
  useEffect(() => {
    // Очищаем предыдущий таймер, если он есть
    if (miningTimerRef.current) clearInterval(miningTimerRef.current)

    miningTimerRef.current = setInterval(() => {
      if (!isComponentMounted.current || !isMiningActive) return // Проверяем, активен ли майнинг

      const now = Date.now()
      const timeDiff = (now - currentMined.lastUpdateTime) / 1000 / 3600 // разница в часах

      // Базовая ставка 0.5 монет за единицу хешрейта в час
      const newMined = (totalHashrate || 0) * 0.5 * (poolMultiplier || 1) * timeDiff

      setCurrentMined((prev) => ({
        value: Math.max(0, prev.value + newMined),
        lastUpdateTime: now,
      }))
      setLastUpdate(now)
    }, 1000)

    // Устанавливаем таймер для синхронизации
    const syncInterval = setInterval(() => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      // Синхронизируем с базой данных каждые 10 секунд
      syncTimeoutRef.current = setTimeout(() => {
        syncProgressRef.current()
      }, 10000)
    }, 10000)

    return () => {
      clearInterval(syncInterval)
      if (miningTimerRef.current) clearInterval(miningTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [totalHashrate, poolMultiplier, lastUpdate, isMiningActive, currentMined.lastUpdateTime])

  const formatTime = (ms) => {
    if (!ms) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleCollect = async () => {
    if (!userId || !isComponentMounted.current) return

    try {
      setCollecting(true)
      setError(null)

      // Получаем актуальный интервал сбора
      const collectionIntervalHours = getCollectionIntervalHours()

      // Рассчитываем награду на основе времени и хешрейта
      const now = Date.now()
      const collectionTime = lastCollectionTime
        ? new Date(lastCollectionTime).getTime()
        : now - collectionIntervalHours * 60 * 60 * 1000
      const timeSinceLastCollection = Math.min((now - collectionTime) / (1000 * 60 * 60), collectionIntervalHours)
      const hourlyRate = totalHashrate * 0.5 * (miningInfo.pool?.multiplier || 1.0)
      const calculatedReward = hourlyRate * timeSinceLastCollection

      console.log("Collecting rewards with params:", {
        userId,
        collectionIntervalHours,
        calculatedReward,
        timeSinceLastCollection,
      })

      const { data, error } = await supabase.rpc("collect_mining_rewards", {
        user_id_param: userId,
        period_hours_param: collectionIntervalHours,
        calculated_reward: calculatedReward,
      })

      if (!isComponentMounted.current) return

      if (error) {
        console.error("Error from collect_mining_rewards:", error)
        throw error
      }

      if (data && data.success) {
        // Вызываем onCollect с новым балансом
        if (typeof onCollect === "function") {
          onCollect(data.new_balance)
        }

        // Обновляем локальное состояние
        if (!miningInfo.has_miner_pass) {
          // Используем интервал из настроек (в часах или минутах)
          const intervalMs = collectionIntervalHours * 60 * 60 * 1000
          setTimeLeft(intervalMs)
        }
        setCurrentPeriodMined(0)
        setCurrentMined({ value: 0, lastUpdateTime: Date.now() }) // Сбрасываем добытые монеты
        setLastUpdate(Date.now()) // Важно: обновляем время последнего обновления
        setIsMiningActive(true) // Активируем майнинг после сбора

        // Обновляем lastCollectionTime на текущее время
        const now = new Date().toISOString()
        setLastCollectionTime(now)

        // Синхронизируем с базой данных
        await supabase.rpc("update_mining_progress", {
          user_id_param: userId,
          current_mined_param: 0,
          last_update_param: now,
        })

        // Обновляем miningInfo локально
        setMiningInfo((prev) => ({
          ...prev,
          last_collection: now,
          time_until_next_collection: miningInfo.has_miner_pass ? 0 : collectionIntervalHours * 60 * 60,
          collection_progress: miningInfo.has_miner_pass ? 100 : 0,
          current_mined: 0,
          last_update: now,
          stats: {
            ...prev.stats,
            total_mined: (Number.parseFloat(prev.stats.total_mined) + calculatedReward).toFixed(2),
          },
        }))

        // Перезагружаем данные
        loadMiningInfoRef.current()
      } else {
        setError(data?.error || "Неизвестная ошибка при сборе наград")
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      if (isComponentMounted.current) {
        setError(`Ошибка при сборе наград: ${err.message || err}`)
      }
    } finally {
      if (isComponentMounted.current) {
        setCollecting(false)
      }
    }
  }

  // Форматируем число с 8 знаками после запятой
  const formatNumber = (num) => {
    return Number.parseFloat(num).toFixed(8)
  }

  // Рассчитываем прогресс для прогресс-бара
  const calculateProgress = () => {
    if (!timeLeft || miningInfo?.has_miner_pass) return 100

    // Используем интервал из настроек (в часах или минутах)
    const collectionIntervalHours = getCollectionIntervalHours()
    const totalTime = collectionIntervalHours * 60 * 60 * 1000 // часы в миллисекундах

    const progress = (timeLeft / totalTime) * 100
    return 100 - progress // Инвертируем прогресс
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

  // Получаем текущий интервал сбора для отображения
  const collectionIntervalHours = getCollectionIntervalHours()
  const isTestMode = systemSettings.test_mode

  return (
    <div className="space-y-2">
      {/* Сбор наград */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={16} />
            <span className="text-white">Сбор наград</span>
            {isTestMode && (
              <span className="text-xs text-orange-400 ml-1">
                (Тестовый режим: {systemSettings.test_collection_interval_minutes} мин)
              </span>
            )}
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
              {collecting ? "Сбор..." : "Собрать"}
            </button>
          </div>
        </div>
      </div>

      {/* Баланс */}
      <div className="bg-[#0F1729]/90 p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Баланс:</span>
            <span className="text-white">{balance}</span>
            <span className="text-blue-400">💎</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">+</span>
            <span className={`${isMiningActive ? "text-green-400" : "text-yellow-400"}`}>
              {formatNumber(currentMined.value)}
              {!isMiningActive && " (остановлено)"}
            </span>
            <span className="text-blue-400">💎</span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
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

