"use client"

import { useState, useEffect } from "react"
import { HardDrive, Zap, Battery, Clock, Gauge, ChevronDown, ChevronUp } from "lucide-react"

export const MyMiners = ({ miners = [], miningStats = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Логирование для отладки
  useEffect(() => {
    console.log("MyMiners component received:", { miners, miningStats })
  }, [miners, miningStats])

  // Если нет майнеров, показываем сообщение
  if (!miners || miners.length === 0) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="text-purple-500" size={18} />
            <span className="text-white">Мои майнеры</span>
          </div>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-4 text-center text-gray-400">
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

  // Рассчитываем общую мощность и потребление
  const totalPower = miners.reduce((sum, miner) => sum + miner.mining_power * miner.quantity, 0)
  const totalConsumption = miners.reduce((sum, miner) => sum + miner.energy_consumption * miner.quantity, 0)

  // Используем данные из miningStats, если они есть, иначе рассчитываем
  const hourlyIncome = miningStats.hourly_rate || totalPower * 0.5
  const efficiency = totalConsumption > 0 ? totalPower / totalConsumption : 0

  // Форматируем числа
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "0.00"
    return Number.parseFloat(num).toFixed(2)
  }

  return (
    <div className="bg-[#0F1729]/90 p-3 rounded-xl">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <HardDrive className="text-purple-500" size={18} />
          <span className="text-white">Мои майнеры</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">Всего: {miners.length}</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Сетка статистики */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Хешрейт */}
        <div className="bg-[#1A2234] p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-sm text-gray-400">Хешрейт</span>
          </div>
          <div className="text-white">{formatNumber(totalPower)} H/s</div>
        </div>

        {/* Энергия */}
        <div className="bg-[#1A2234] p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Battery size={14} className="text-green-500" />
            <span className="text-sm text-gray-400">Энергия</span>
          </div>
          <div className="text-white">{formatNumber(totalConsumption)} W</div>
        </div>

        {/* Доход в час */}
        <div className="bg-[#1A2234] p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-blue-500" />
            <span className="text-sm text-gray-400">Доход в час</span>
          </div>
          <div className="text-white">{formatNumber(hourlyIncome)} 💎</div>
        </div>

        {/* Эффективность */}
        <div className="bg-[#1A2234] p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={14} className="text-purple-500" />
            <span className="text-sm text-gray-400">Эффективность</span>
          </div>
          <div className="text-white">{formatNumber(efficiency)} H/W</div>
        </div>
      </div>

      {/* Список майнеров по категориям */}
      {isExpanded && (
        <div className="space-y-3">
          {Object.entries(minersByCategory).map(([category, categoryMiners]) => (
            <div key={category} className="bg-[#1A2234] rounded-lg p-3">
              <div className="text-sm font-medium mb-2 text-white capitalize">{category}</div>
              <div className="space-y-2">
                {categoryMiners.map((miner) => (
                  <div key={miner.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#0F1729] rounded-full flex items-center justify-center">
                        <HardDrive size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{miner.model_name || `Майнер #${miner.model_id}`}</div>
                        <div className="text-xs text-gray-400">
                          {miner.mining_power} H/s × {miner.quantity} шт.
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{miner.mining_power * miner.quantity} H/s</div>
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

