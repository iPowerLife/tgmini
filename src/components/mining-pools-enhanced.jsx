"use client"

import { useState, useEffect } from "react"
import { Users, ChevronDown, ChevronUp, BarChart2, Zap, DollarSign, Percent, Clock, Check, Info } from "lucide-react"
import { createMiningService } from "../services/mining-service"
import { supabase } from "../supabase"

// Компонент для отображения истории изменений эффективности пула
const PoolEfficiencyHistory = ({ poolName, onClose }) => {
  const [history, setHistory] = useState([
    // Моковые данные для истории (в реальном приложении будут загружаться из базы)
    { date: "2023-03-01", efficiency: 98.2, change: "+0.2%" },
    { date: "2023-03-05", efficiency: 98.5, change: "+0.3%" },
    { date: "2023-03-10", efficiency: 98.3, change: "-0.2%" },
    { date: "2023-03-15", efficiency: 98.7, change: "+0.4%" },
    { date: "2023-03-20", efficiency: 99.0, change: "+0.3%" },
    { date: "2023-03-25", efficiency: 98.8, change: "-0.2%" },
    { date: "2023-04-01", efficiency: 99.1, change: "+0.3%" },
  ])

  // Форматирование даты
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={18} />
          <span className="font-medium">История эффективности</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <ChevronUp size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
            <span className="text-sm text-gray-400">{formatDate(item.date)}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.efficiency}%</span>
              <span className={`text-xs ${item.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент сравнения пулов
const PoolsComparison = ({ pools, selectedPool, onSelectPool, onClose }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Info className="text-blue-400" size={18} />
          <span className="font-medium">Сравнение пулов</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <ChevronUp size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-2 text-left">Пул</th>
              <th className="pb-2 text-center">Множитель</th>
              <th className="pb-2 text-center">Комиссия</th>
              <th className="pb-2 text-center">Мин. майнеров</th>
              <th className="pb-2 text-center">Действие</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <tr
                key={pool.name}
                className={`border-b border-gray-700 last:border-0 ${selectedPool === pool.name ? "bg-blue-900/20" : ""}`}
              >
                <td className="py-3">
                  <div className="font-medium">{pool.display_name}</div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap size={14} className="text-yellow-400" />
                    <span className={selectedPool === pool.name ? "text-blue-400" : ""}>x{pool.multiplier}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Percent size={14} className="text-red-400" />
                    <span>{pool.fee_percent}%</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={14} className="text-gray-400" />
                    <span>{pool.min_miners}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  {selectedPool === pool.name ? (
                    <div className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                      <Check size={12} className="mr-1" />
                      Выбран
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectPool(pool.name)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs"
                    >
                      Выбрать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Обновленный компонент пула майнинга
export const MiningPoolsEnhanced = ({ user, onPoolChanged }) => {
  const [miningService, setMiningService] = useState(null)
  const [pools, setPools] = useState([])
  const [selectedPool, setSelectedPool] = useState("standard")
  const [isChanging, setIsChanging] = useState(false)
  const [poolStats, setPoolStats] = useState({
    standard: { miners: 0, hashrate: 0, efficiency: 98 },
    advanced: { miners: 0, hashrate: 0, efficiency: 99 },
    premium: { miners: 0, hashrate: 0, efficiency: 99.5 },
  })
  const [showComparison, setShowComparison] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Инициализация сервиса майнинга и загрузка пулов
  useEffect(() => {
    if (!user?.id) return

    const initData = async () => {
      // Инициализируем сервис майнинга
      const service = await createMiningService(user.id)
      setMiningService(service)

      // Устанавливаем текущий пул
      setSelectedPool(user.mining_pool || "standard")

      // Загружаем данные о пулах
      const { data, error } = await supabase.from("mining_pools").select("*").order("min_miners")

      if (error) {
        console.error("Error loading pools:", error)
      } else {
        setPools(data || [])
      }

      // Загружаем статистику пулов (в реальном приложении это будет API запрос)
      // Здесь используем моковые данные
      setPoolStats({
        standard: {
          miners: 3240,
          hashrate: 45.8,
          efficiency: 98,
        },
        advanced: {
          miners: 1580,
          hashrate: 128.5,
          efficiency: 99,
        },
        premium: {
          miners: 420,
          hashrate: 356.2,
          efficiency: 99.5,
        },
      })
    }

    initData()
  }, [user?.id, user?.mining_pool])

  // Обработчик смены пула
  const handlePoolChange = async (poolName) => {
    if (!miningService || isChanging || selectedPool === poolName) return

    try {
      setIsChanging(true)

      const result = await miningService.changePool(poolName)

      if (result.success) {
        setSelectedPool(poolName)

        // Вызываем колбэк для обновления данных
        if (onPoolChanged) {
          onPoolChanged(poolName)
        }
      } else {
        alert(`Ошибка: ${result.error || "Не удалось сменить пул"}`)
      }
    } catch (error) {
      console.error("Error changing pool:", error)
      alert("Произошла ошибка при смене пула")
    } finally {
      setIsChanging(false)
    }
  }

  // Получаем данные выбранного пула
  const currentPool = pools.find((p) => p.name === selectedPool) || {
    name: "standard",
    display_name: "Стандартный пул",
    fee_percent: 5,
  }

  // Получаем статистику выбранного пула
  const currentStats = poolStats[selectedPool] || { miners: 0, hashrate: 0, efficiency: 0 }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-400" size={20} />
          <span className="font-medium">Майнинг пулы</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowComparison(!showComparison)
              if (showComparison) setShowHistory(false)
            }}
            className="text-sm text-blue-400 flex items-center"
          >
            Сравнить
            {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => {
              setShowHistory(!showHistory)
              if (showHistory) setShowComparison(false)
            }}
            className="text-sm text-blue-400 flex items-center"
          >
            История
            {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Блок сравнения пулов */}
      {showComparison && (
        <PoolsComparison
          pools={pools}
          selectedPool={selectedPool}
          onSelectPool={handlePoolChange}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Блок истории эффективности */}
      {showHistory && <PoolEfficiencyHistory poolName={selectedPool} onClose={() => setShowHistory(false)} />}

      {/* Если не открыто сравнение или история, показываем стандартный интерфейс */}
      {!showComparison && !showHistory && (
        <>
          <div className="text-sm text-gray-400 mb-4">Выберите пул для майнинга</div>

          <div className="flex gap-2 mb-4">
            {pools.map((pool) => (
              <button
                key={pool.name}
                onClick={() => handlePoolChange(pool.name)}
                className={`px-4 py-2 rounded-lg ${
                  selectedPool === pool.name ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                disabled={isChanging}
              >
                {pool.display_name}
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">{currentPool.display_name}</span>
              <span className="text-blue-400 text-sm">{currentStats.miners.toLocaleString()} майнеров</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Хешрейт пула</div>
                <div className="font-medium">{currentStats.hashrate} PH/s</div>
                <div className="text-green-500 text-sm">+1.2%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Эффективность</div>
                <div className="font-medium">{currentStats.efficiency}%</div>
                <div className="text-green-500 text-sm">+0.5%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Комиссия</div>
                <div className="font-medium">{currentPool.fee_percent}%</div>
                <div className="text-gray-400 text-sm">фиксированная</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-sm text-gray-400">Время в пуле:</span>
                </div>
                <span className="text-sm">14 дней</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-green-400" />
                  <span className="text-sm text-gray-400">Доход в пуле:</span>
                </div>
                <span className="text-sm text-green-400">+15.3%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

