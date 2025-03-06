"use client"

import { useState, useEffect } from "react"
import { HardDrive, ChevronDown, ChevronUp, Zap, Battery, Clock } from "lucide-react"

export const MyMiners = ({ miners = [], miningStats = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [totalPower, setTotalPower] = useState(0)
  const [totalConsumption, setTotalConsumption] = useState(0)

  useEffect(() => {
    // Рассчитываем общую мощность и потребление
    const newTotalPower = miners.reduce(
      (sum, miner) => sum + (Number(miner.mining_power) || 0) * (Number(miner.quantity) || 1),
      0,
    )
    const newTotalConsumption = miners.reduce(
      (sum, miner) => sum + (Number(miner.energy_consumption) || 0) * (Number(miner.quantity) || 1),
      0,
    )
    setTotalPower(newTotalPower)
    setTotalConsumption(newTotalConsumption)

    console.log("MyMiners component data:", {
      miners,
      miningStats,
      totalPower: newTotalPower,
      totalConsumption: newTotalConsumption,
      firstMiner: miners.length > 0 ? miners[0] : null,
    })
  }, [miners, miningStats])

  // Если нет майнеров, показываем сообщение
  if (!miners || miners.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="text-purple-500" size={18} />
            <span className="font-medium">Мои майнеры</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
          У вас пока нет майнеров. Приобретите майнеры в магазине, чтобы начать добывать монеты.
        </div>
      </div>
    )
  }

  // Группируем майнеры по категориям
  const minersByCategory = miners.reduce((acc, miner) => {
    const category = miner.category || "other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(miner)
    return acc
  }, {})

  // Форматируем статистику
  const formatStat = (value) => {
    // Check if value is undefined, null, NaN, or not a number
    if (value === undefined || value === null || isNaN(value) || typeof value !== "number") {
      return "0"
    }

    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M"
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K"
    }
    return value.toFixed(2)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <HardDrive className="text-purple-500" size={18} />
          <span className="font-medium">Мои майнеры</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">Всего: {miners.length}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Статистика майнинга */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-sm font-medium">Хешрейт</span>
          </div>
          <div className="text-lg font-semibold">{formatStat(totalPower)} H/s</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Battery size={14} className="text-green-500" />
            <span className="text-sm font-medium">Энергия</span>
          </div>
          <div className="text-lg font-semibold">{formatStat(totalConsumption)} W</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-500" />
            <span className="text-sm font-medium">Доход в час</span>
          </div>
          <div className="text-lg font-semibold">{formatStat(miningStats.hourly_rate || totalPower * 0.5)} 💎</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-purple-500" />
            <span className="text-sm font-medium">Эффективность</span>
          </div>
          <div className="text-lg font-semibold">
            {totalConsumption > 0 ? formatStat(totalPower / totalConsumption) : "0"} H/W
          </div>
        </div>
      </div>

      {/* Список майнеров по категориям */}
      {isExpanded && (
        <div className="space-y-3">
          {Object.entries(minersByCategory).map(([category, categoryMiners]) => (
            <div key={category} className="bg-gray-800 rounded-lg p-3">
              <div className="text-sm font-medium mb-2 capitalize">{category}</div>
              <div className="space-y-2">
                {categoryMiners.map((miner) => (
                  <div key={miner.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <HardDrive size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm">{miner.model_name || `Майнер #${miner.model_id}`}</div>
                        <div className="text-xs text-gray-400">
                          {miner.mining_power} H/s × {miner.quantity} шт.
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{miner.mining_power * miner.quantity} H/s</div>
                      <div className="text-xs text-gray-400">{miner.energy_consumption * miner.quantity} W</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyMiners

