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
      // Вместо RPC используем прямой запрос к таблице
      const { error } = await supabase
        .from("mining_stats")
        .update({
          current_mined: currentMined.value,
          last_update: new Date(lastUpdate).toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error syncing progress:", error)
      }
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

      // Сначала попробуем использовать RPC функцию, если она доступна
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_mining_info", {
        user_id_param: userId,
      })

      if (!rpcError && rpcData) {
        console.log("Loaded mining info via RPC:", rpcData)

        if (!isComponentMounted.current) return

        setMiningInfo(rpcData)

        // Устанавливаем начальные значения из базы данных
        if (rpcData.current_mined !== undefined) {
          setCurrentMined({
            value: Number(rpcData.current_mined) || 0,
            lastUpdateTime: rpcData.last_update ? new Date(rpcData.last_update).getTime() : Date.now(),
          })
        }
        if (rpcData.last_update) {
          setLastUpdate(new Date(rpcData.last_update).getTime())
        }

        // Проверяем, должен ли майнинг быть активным
        const canCollect = rpcData.time_until_next_collection === 0 || rpcData.has_miner_pass
        setIsMiningActive(!canCollect) // Инвертируем логику: если нельзя собирать, значит майнинг активен

        // Если мы в тестовом режиме, используем интервал в минутах
        const collectionIntervalHours = getCollectionIntervalHours()

        if (rpcData.time_until_next_collection > 0) {
          // Если мы в тестовом режиме, возможно нужно скорректировать время
          if (systemSettings.test_mode) {
            // Проверяем, не превышает ли оставшееся время тестовый интервал
            const testIntervalSeconds = systemSettings.test_collection_interval_minutes * 60
            if (rpcData.time_until_next_collection > testIntervalSeconds) {
              setTimeLeft(testIntervalSeconds * 1000)
            } else {
              setTimeLeft(rpcData.time_until_next_collection * 1000)
            }
          } else {
            setTimeLeft(rpcData.time_until_next_collection * 1000)
          }
        } else {
          setTimeLeft(0)
        }

        // Обновляем время последнего сбора
        if (rpcData.last_collection !== lastCollectionTime) {
          setLastCollectionTime(rpcData.last_collection)
          setCurrentPeriodMined(0)
        }

        // Рассчитываем текущую добычу
        if (rpcData.total_hashrate && !collecting) {
          const hourlyRate = rpcData.total_hashrate * 0.5 * (rpcData.pool?.multiplier || 1.0)
          const timeSinceLastCollection = lastCollectionTime
            ? (Date.now() - new Date(lastCollectionTime).getTime()) / (1000 * 60 * 60)
            : 0
          const minedAmount = hourlyRate * Math.min(timeSinceLastCollection, collectionIntervalHours)
          setCurrentPeriodMined(Math.round(minedAmount * 100) / 100)
        }

        setLoading(false)
        return
      }

      console.log("RPC failed, falling back to direct queries:", rpcError)

      // Если RPC не сработал, используем прямые запросы
      // Получаем данные о майнинге напрямую из таблиц
      const { data: miningStats, error: miningStatsError } = await supabase
        .from("mining_stats")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (miningStatsError && miningStatsError.code !== "PGRST116") {
        throw miningStatsError
      }

      const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("has_miner_pass, balance")
        .eq("id", userId)
        .single()

      if (userError) {
        throw userError
      }

      // Получаем данные о майнерах пользователя
      const { data: userMiners, error: userMinersError } = await supabase
        .from("user_miners")
        .select("*, miner:miner_id(*)")
        .eq("user_id", userId)

      if (userMinersError) {
        console.error("Error fetching user miners:", userMinersError)
      }

      console.log("User miners:", userMiners)

      // Если таблица user_miners не существует или пуста, попробуем другую структуру
      let miners = []
      if (!userMiners || userMiners.length === 0) {
        const { data: directMiners, error: directMinersError } = await supabase
          .from("miners")
          .select("*")
          .eq("user_id", userId)

        if (directMinersError) {
          console.error("Error fetching direct miners:", directMinersError)
        } else {
          miners = directMiners || []
          console.log("Direct miners:", miners)
        }
      } else {
        // Преобразуем данные из user_miners в формат, который ожидает компонент
        miners = userMiners.map((um) => ({
          ...um.miner,
          user_id: userId,
          quantity: um.quantity || 1,
        }))
      }

      const { data: poolInfo, error: poolError } = await supabase
        .from("mining_pools")
        .select("*")
        .eq("id", miningStats?.pool_id || 1)
        .single()

      if (poolError && poolError.code !== "PGRST116") {
        console.error("Error fetching pool info:", poolError)
      }

      // Рассчитываем общий хешрейт
      const totalHashrate = miners.reduce((sum, miner) => {
        const quantity = miner.quantity || 1
        return sum + miner.hashrate * quantity
      }, 0)

      // Рассчитываем время до следующего сбора
      const now = new Date()
      const lastCollection = miningStats?.last_collection ? new Date(miningStats.last_collection) : null
      const collectionIntervalHours = getCollectionIntervalHours()
      const collectionIntervalMs = collectionIntervalHours * 60 * 60 * 1000

      let timeUntilNextCollection = 0
      if (lastCollection && !userInfo.has_miner_pass) {
        const nextCollectionTime = new Date(lastCollection.getTime() + collectionIntervalMs)
        timeUntilNextCollection = Math.max(0, (nextCollectionTime.getTime() - now.getTime()) / 1000)
      }

      // Собираем все данные в один объект
      const miningInfo = {
        miners: miners,
        total_hashrate: totalHashrate,
        pool: poolInfo || { display_name: "Стандартный", multiplier: 1, fee_percent: 0 },
        has_miner_pass: userInfo.has_miner_pass,
        time_until_next_collection: timeUntilNextCollection,
        last_collection: miningStats?.last_collection,
        current_mined: miningStats?.current_mined || 0,
        last_update: miningStats?.last_update,
        stats: {
          total_mined: miningStats?.total_mined || 0,
          daily_average: miningStats?.daily_average || 0,
          mining_days: miningStats?.mining_days || 0,
        },
      }

      if (!isComponentMounted.current) return

      console.log("Constructed mining info:", miningInfo)
      setMiningInfo(miningInfo)

      // Устанавливаем начальные значения из базы данных
      if (miningInfo.current_mined !== undefined) {
        setCurrentMined({
          value: Number(miningInfo.current_mined) || 0,
          lastUpdateTime: miningInfo.last_update ? new Date(miningInfo.last_update).getTime() : Date.now(),
        })
      }
      if (miningInfo.last_update) {
        setLastUpdate(new Date(miningInfo.last_update).getTime())
      }

      // Проверяем, должен ли майнинг быть активным
      const canCollect = miningInfo.time_until_next_collection === 0 || miningInfo.has_miner_pass
      setIsMiningActive(!canCollect) // Инвертируем логику: если нельзя собирать, значит майнинг активен

      if (miningInfo.time_until_next_collection > 0) {
        // Если мы в тестовом режиме, возможно нужно скорректировать время
        if (systemSettings.test_mode) {
          // Проверяем, не превышает ли оставшееся время тестовый интервал
          const testIntervalSeconds = systemSettings.test_collection_interval_minutes * 60
          if (miningInfo.time_until_next_collection > testIntervalSeconds) {
            setTimeLeft(testIntervalSeconds * 1000)
          } else {
            setTimeLeft(miningInfo.time_until_next_collection * 1000)
          }
        } else {
          setTimeLeft(miningInfo.time_until_next_collection * 1000)
        }
      } else {
        setTimeLeft(0)
      }

      // Обновляем время последнего сбора
      if (miningInfo.last_collection !== lastCollectionTime) {
        setLastCollectionTime(miningInfo.last_collection)
        setCurrentPeriodMined(0)
      }

      // Рассчитываем текущую добычу
      if (miningInfo.total_hashrate && !collecting) {
        const hourlyRate = miningInfo.total_hashrate * 0.5 * (miningInfo.pool?.multiplier || 1.0)
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

      // Сначала попробуем использовать RPC функцию
      const collectionIntervalHours = getCollectionIntervalHours()
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

      // Пробуем все возможные имена функций
      const functionNames = [
        "collect_mining_rewards",
        "collect_mining_rewards_test",
        "collect_mining_rewards_d_hours_param",
      ]

      let success = false
      let data = null
      let error = null

      for (const funcName of functionNames) {
        console.log(`Trying to call ${funcName}...`)
        const result = await supabase.rpc(funcName, {
          user_id_param: userId,
          period_hours_param: collectionIntervalHours,
          calculated_reward: calculatedReward,
        })

        if (!result.error) {
          success = true
          data = result.data
          console.log(`Successfully called ${funcName}:`, data)
          break
        } else {
          console.error(`Error calling ${funcName}:`, result.error)
          error = result.error
        }
      }

      // Если все RPC вызовы не сработали, используем прямые запросы
      if (!success) {
        console.log("All RPC calls failed, using direct queries")

        // Получаем текущий баланс пользователя
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("balance, has_miner_pass")
          .eq("id", userId)
          .single()

        if (userError) {
          throw userError
        }

        // Проверяем, прошло ли достаточно времени с последнего сбора
        if (!userData.has_miner_pass && lastCollectionTime) {
          const lastCollectionDate = new Date(lastCollectionTime)
          const hoursSinceLastCollection = (now - lastCollectionDate.getTime()) / (1000 * 60 * 60)

          if (hoursSinceLastCollection < collectionIntervalHours) {
            throw new Error("Слишком рано для сбора наград")
          }
        }

        // Обновляем баланс пользователя
        const newBalance = Number.parseFloat(userData.balance) + calculatedReward
        const { error: updateUserError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

        if (updateUserError) {
          throw updateUserError
        }

        // Обновляем статистику майнинга
        const nowIso = new Date().toISOString()
        const { data: miningStats, error: statsError } = await supabase
          .from("mining_stats")
          .select("total_mined")
          .eq("user_id", userId)
          .single()

        if (statsError && statsError.code !== "PGRST116") {
          throw statsError
        }

        const totalMined = Number.parseFloat(miningStats?.total_mined || 0) + calculatedReward

        const { error: updateStatsError } = await supabase
          .from("mining_stats")
          .update({
            last_collection: nowIso,
            current_mined: 0,
            last_update: nowIso,
            total_mined: totalMined,
          })
          .eq("user_id", userId)

        if (updateStatsError) {
          throw updateStatsError
        }

        data = {
          success: true,
          new_balance: newBalance,
        }
      }

      if (!isComponentMounted.current) return

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
        const nowIso = new Date().toISOString()
        setLastCollectionTime(nowIso)

        // Обновляем miningInfo локально
        setMiningInfo((prev) => ({
          ...prev,
          last_collection: nowIso,
          time_until_next_collection: miningInfo.has_miner_pass ? 0 : collectionIntervalHours * 60 * 60,
          collection_progress: miningInfo.has_miner_pass ? 100 : 0,
          current_mined: 0,
          last_update: nowIso,
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

  // Проверяем наличие майнеров и выводим отладочную информацию
  console.log("Mining info:", miningInfo)
  console.log("Miners:", miningInfo?.miners)

  // Проверяем, есть ли у пользователя майнеры
  const hasMiners = miningInfo?.miners && miningInfo.miners.length > 0

  if (!hasMiners) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="text-sm text-gray-400">У вас пока нет майнеров</div>
        <div className="text-xs text-gray-500 mt-2">Отладочная информация: {JSON.stringify(miningInfo)}</div>
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

