"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

  // Функция загрузки данных о майнинге
  const loadMiningInfo = useCallback(async () => {
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

      // П��лучаем данные о майнерах пользователя
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

      if (miningInfo.miners?.length > 0 && miningInfo.total_hashrate > 0) {
        setIsMiningActive(true)
      } else {
        setIsMiningActive(false)
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
  }, [userId, lastCollectionTime, collecting, systemSettings])

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true
    loadMiningInfo()

    // Устанавливаем таймер для обратного отсчета
    timerRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        setTimeLeft((prev) => {
          const newTime = prev <= 1000 ? 0 : prev - 1000
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
    if (!miningInfo?.miners?.length || !miningInfo.total_hashrate) return

    // Очищаем предыдущий таймер, если он есть
    if (miningTimerRef.current) clearInterval(miningTimerRef.current)

    miningTimerRef.current = setInterval(() => {
      if (!isComponentMounted.current) return

      // Проверяем условия для активного майнинга
      const shouldMine = miningInfo.has_miner_pass || timeLeft === 0

      if (!shouldMine) {
        setIsMiningActive(false)
        return
      }

      setIsMiningActive(true)
      const now = Date.now()
      const timeDiff = (now - currentMined.lastUpdateTime) / 1000 / 3600 // разница в часах

      // Используем хешрейт из miningInfo вместо prop
      const currentHashrate = miningInfo.total_hashrate
      const poolMult = miningInfo.pool?.multiplier || 1

      // Базовая ставка 0.5 монет за единицу хешрейта в час
      const newMined = currentHashrate * 0.5 * poolMult * timeDiff

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
        if (currentMined.value > 0) {
          syncProgressRef.current()
        }
      }, 10000)
    }, 10000)

    return () => {
      clearInterval(syncInterval)
      if (miningTimerRef.current) clearInterval(miningTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [miningInfo, timeLeft, currentMined.lastUpdateTime])

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

      // Проверяем, есть ли что собирать
      if (currentMined.value <= 0) {
        setError("Нет доступных наград для сбора")
        return
      }

      // Сначала пробуем использовать RPC функции
      const functionNames = [
        "collect_mining_rewards",
        "coll_mining_rewards",
        "collect_mining_d_hours_param",
        "collect_mining_rewards_test",
      ]

      let success = false
      let rpcError = null

      for (const funcName of functionNames) {
        console.log(`Trying to call ${funcName}...`)
        const { data, error } = await supabase.rpc(funcName, {
          user_id_param: userId,
          period_hours_param: collectionIntervalHours,
          calculated_reward: currentMined.value,
        })

        if (!error) {
          console.log(`Successfully called ${funcName}:`, data)
          success = true

          // Обновляем локальное состояние
          if (typeof onCollect === "function") {
            onCollect(data.new_balance)
          }

          // Сбрасываем накопленные монеты
          setCurrentMined({ value: 0, lastUpdateTime: Date.now() })

          // Устанавливаем новый таймер для обычных пользователей
          if (!miningInfo.has_miner_pass) {
            const intervalMs = collectionIntervalHours * 60 * 60 * 1000
            setTimeLeft(intervalMs)
          }

          const nowIso = new Date().toISOString()
          setLastCollectionTime(nowIso)
          setCurrentPeriodMined(0)
          setLastUpdate(Date.now())

          // Перезагружаем данные
          await loadMiningInfo()
          break
        } else {
          console.error(`Error calling ${funcName}:`, error)
          rpcError = error
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

        if (userError) throw userError

        // Проверяем время последнего сбора только для пользователей без пропуска
        if (!userData.has_miner_pass && lastCollectionTime) {
          const lastCollection = new Date(lastCollectionTime)
          const now = new Date()
          const hoursSinceLastCollection = (now - lastCollection) / (1000 * 60 * 60)

          if (hoursSinceLastCollection < collectionIntervalHours) {
            throw new Error(
              `Подождите ещё ${formatTime(collectionIntervalHours * 60 * 60 * 1000 - (now - lastCollection))}`,
            )
          }
        }

        // Обновляем баланс пользователя
        const rewardAmount = currentMined.value
        const newBalance = Number.parseFloat(userData.balance) + rewardAmount

        const { error: updateUserError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

        if (updateUserError) throw updateUserError

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

        const totalMined = Number.parseFloat(miningStats?.total_mined || 0) + rewardAmount

        const { error: updateStatsError } = await supabase
          .from("mining_stats")
          .update({
            last_collection: nowIso,
            current_mined: 0,
            last_update: nowIso,
            total_mined: totalMined,
          })
          .eq("user_id", userId)

        if (updateStatsError) throw updateStatsError

        // Обновляем локальное состояние
        if (typeof onCollect === "function") {
          onCollect(newBalance)
        }

        // Сбрасываем накопленные монеты
        setCurrentMined({ value: 0, lastUpdateTime: Date.now() })

        // Устанавливаем новый таймер для обычных пользователей
        if (!userData.has_miner_pass) {
          const intervalMs = collectionIntervalHours * 60 * 60 * 1000
          setTimeLeft(intervalMs)
        }

        setLastCollectionTime(nowIso)
        setCurrentPeriodMined(0)
        setLastUpdate(Date.now())

        // Перезагружаем данные
        await loadMiningInfo()
      }
    } catch (err) {
      console.error("Error collecting rewards:", err)
      setError(err.message || "Произошла ошибка при сборе наград")
    } finally {
      setCollecting(false)
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

