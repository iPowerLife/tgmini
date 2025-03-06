"use client"

import { useState } from "react"
import { Zap, Battery, Clock, Gauge } from "lucide-react"

export const MyMiners = ({ miners = [], miningStats = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Рассчитываем общую мощность и потребление
  const totalPower = miners.reduce((sum, miner) => sum + miner.mining_power * miner.quantity, 0)
  const totalConsumption = miners.reduce((sum, miner) => sum + miner.energy_consumption * miner.quantity, 0)
  const hourlyIncome = totalPower * 0.5 // Базовая ставка 0.5 монет за единицу хешрейта в час
  const efficiency = totalConsumption > 0 ? totalPower / totalConsumption : 0

  // Форматируем числа
  const formatNumber = (num) => {
    return num.toFixed(2)
  }

  return (
    <div className="bg-[#0F1729]/90 p-3 rounded-xl">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-400">💻</span>
          <span className="text-white">Мои майнеры</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">Всего: {miners.length}</span>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white">
            {isExpanded ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* Сетка статистики */}
      <div className="grid grid-cols-2 gap-2">
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
    </div>
  )
}

export default MyMiners

