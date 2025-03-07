"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { Coins, Clock, ArrowDown, AlertCircle, CheckCircle2, Terminal, Cpu, Server, Zap } from "lucide-react"

export const MiningRewards = ({ userId }) => {
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [showLogs, setShowLogs] = useState(false)
  const [miningLogs, setMiningLogs] = useState([])
  const intervalRef = useRef(null)
  const logIntervalRef = useRef(null)
  const isComponentMounted = useRef(true)
  const logsContainerRef = useRef(null)

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
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current)
      }
    }
  }, [userId, lastUpdate])

  // Генерация логов майнинга
  useEffect(() => {
    if (!miningInfo || !showLogs) return

    const generateLog = () => {
      if (!isComponentMounted.current) return

      const hashrate = miningInfo.total_hashrate || 0
      const hourlyRate = miningInfo.rewards?.hourly_rate || 0

      const logTypes = [
        () => {
          const hash = Math.random().toString(16).substring(2, 10).toUpperCase()
          return `[INFO] Найден блок: 0x${hash}... (${(Math.random() * 0.01).toFixed(4)} 💎)`
        },
        () => `[SYSTEM] Хешрейт стабилен: ${formatNumber(hashrate)} H/s`,
        () => `[MINER] Текущая скорость: ${formatNumber(hourlyRate)} 💎/час`,
        () => {
          const temp = Math.floor(55 + Math.random() * 15)
          return `[HARDWARE] Температура: ${temp}°C (норма)`
        },
        () => {
          const efficiency = Math.floor(90 + Math.random() * 9)
          return `[SYSTEM] Эффективность: ${efficiency}%`
        },
      ]

      const newLog = logTypes[Math.floor(Math.random() * logTypes.length)]()

      setMiningLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, newLog]
        // Ограничиваем количество логов до 100
        return updatedLogs.slice(-100)
      })

      // Прокручиваем контейнер с логами вниз
      if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
      }
    }

    // Генерируем начальные логи
    if (miningLogs.length === 0) {
      setMiningLogs([
        "[SYSTEM] Инициализация майнера...",
        "[SYSTEM] Подключение к пулу...",
        `[SYSTEM] Майнер запущен, хешрейт: ${formatNumber(miningInfo.total_hashrate)} H/s`,
      ])
    }

    // Генерируем новые логи каждые 3-5 секунд
    logIntervalRef.current = setInterval(
      () => {
        generateLog()
      },
      3000 + Math.random() * 2000,
    )

    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current)
      }
    }
  }, [miningInfo, showLogs])

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

        // Добавляем лог о сборе наград
        if (showLogs) {
          setMiningLogs((prevLogs) => [...prevLogs, `[REWARD] Собрано ${formatNumber(data.amount)} 💎!`])
        }

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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Майнинг</span>
        </div>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Terminal size={14} />
          <span>{showLogs ? "Скрыть логи" : "Показать логи"}</span>
        </button>
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

      {/* Логи майнинга */}
      {showLogs && (
        <div className="mb-3">
          <div ref={logsContainerRef} className="bg-black/80 rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs">
            {miningLogs.map((log, index) => {
              // Определяем цвет для разных типов логов
              let logColor = "text-gray-300"
              if (log.includes("[INFO]")) logColor = "text-blue-400"
              if (log.includes("[SYSTEM]")) logColor = "text-green-400"
              if (log.includes("[HARDWARE]")) logColor = "text-yellow-400"
              if (log.includes("[MINER]")) logColor = "text-purple-400"
              if (log.includes("[REWARD]")) logColor = "text-yellow-300"
              if (log.includes("Ошибка")) logColor = "text-red-400"

              return (
                <div key={index} className={`${logColor} mb-1`}>
                  {log}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Основная информация */}
      <div className="bg-gradient-to-b from-[#1A2234] to-[#131B2E] rounded-lg p-4 mb-3 border border-blue-900/30">
        <div className="flex flex-col">
          {/* Верхняя панель с индикаторами */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-400">Активен</span>
            </div>
            <div className="flex items-center gap-2">
              <Server size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">Пул: {miningInfo.pool?.name || "standard"}</span>
            </div>
          </div>

          {/* Основная информация о добыче */}
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-1">Добыто монет</div>
            <div className="text-2xl font-bold mb-2 text-blue-300">{formatNumber(rewardAmount)} 💎</div>

            {/* Прогресс-бар с анимацией */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full relative"
                style={{ width: `${Math.min(100, collectionProgress)}%` }}
              >
                {/* Анимированный эффект пульсации */}
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
              <Clock size={14} className="text-blue-400" />
              <span>{canCollect ? "Можно собрать сейчас" : `До сбора: ${formatTime(timeUntilCollection)}`}</span>
            </div>

            {/* Информация о скорости майнинга */}
            <div className="w-full grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#0F1729]/80 rounded-lg p-2 flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-1">Скорость майнинга</div>
                <div className="text-lg font-medium text-blue-300 flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" />
                  {formatNumber(hourlyRate)} 💎/час
                </div>
              </div>

              <div className="bg-[#0F1729]/80 rounded-lg p-2 flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-1">Хешрейт</div>
                <div className="text-lg font-medium text-blue-300 flex items-center gap-1">
                  <Cpu size={14} className="text-blue-400" />
                  {formatNumber(total_hashrate)} H/s
                </div>
              </div>
            </div>

            {/* Формула расчета */}
            <div className="text-xs text-gray-500 bg-[#0F1729]/50 p-2 rounded-lg w-full text-center">
              {formatNumber(total_hashrate)} H/s × {formatNumber(coinsPerHs, 6)} 💎 = {formatNumber(hourlyRate)} 💎/час
            </div>
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
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-500/20"
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

