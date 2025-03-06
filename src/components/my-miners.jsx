"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Cpu, Zap, Flame, Clock, Coins, BarChart3, Hash } from "lucide-react"

export const MyMiners = ({ miners = [], miningStats = {} }) => {
  const [showMiners, setShowMiners] = useState(false)

  // Рассчитываем общую мощность майнеров
  const totalPower = miners.reduce((sum, miner) => sum + (miner.model?.mining_power || 0) * (miner.quantity || 1), 0)

  // Рассчитываем общее энергопотребление
  const totalEnergy = miners.reduce(
    (sum, miner) => sum + (miner.model?.energy_consumption || 0) * (miner.quantity || 1),
    0,
  )

  // Получаем общее количество майнеров (с учетом количества каждого типа)
  const totalMinersCount = miners.reduce((sum, miner) => sum + (miner.quantity || 1), 0)

  // Заглушки для данных, которые могут отсутствовать
  const averageHashrate = miningStats.dailyAverage || Math.round(totalPower * 0.85)
  const totalCoins = miningStats.totalMined || 1250
  const totalMiningTime = miningStats.totalTime || "14д 6ч"

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Статистика майнинга</span>
        </div>
      </div>

      {/* Статистика майнинга */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Всего майнеров</span>
          </div>
          <div className="text-lg font-semibold">{totalMinersCount}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Hash size={14} className="text-green-400" />
            <span className="text-xs text-gray-400">Общий хешрейт</span>
          </div>
          <div className="text-lg font-semibold">{totalPower}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 size={14} className="text-purple-400" />
            <span className="text-xs text-gray-400">Средний за 24ч</span>
          </div>
          <div className="text-lg font-semibold">{averageHashrate}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-gray-400">Энергопотребление</span>
          </div>
          <div className="text-lg font-semibold">{totalEnergy}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-xs text-gray-400">Добыто монет</span>
          </div>
          <div className="text-lg font-semibold">{totalCoins}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Общее время</span>
          </div>
          <div className="text-lg font-semibold">{totalMiningTime}</div>
        </div>
      </div>

      {/* Кнопка для отображения списка майнеров */}
      <button
        onClick={() => setShowMiners(!showMiners)}
        className="w-full flex items-center justify-center gap-1 text-sm text-blue-400 bg-gray-800 rounded-lg py-2 hover:bg-gray-750 transition-colors mb-3"
      >
        {showMiners ? (
          <>
            <ChevronUp size={16} />
            <span>Скрыть майнеры</span>
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            <span>Показать мои майнеры ({miners.length})</span>
          </>
        )}
      </button>

      {/* Список майнеров (отображается только если showMiners = true) */}
      {showMiners && miners.length > 0 && (
        <div className="space-y-2">
          {miners.map((miner) => {
            const categoryName = miner.model?.category?.name?.toLowerCase() || ""
            const color = categoryName.includes("premium")
              ? "yellow"
              : categoryName.includes("advanced")
                ? "purple"
                : "blue"

            return (
              <div key={miner.id} className={`bg-gray-800 rounded-lg p-3 border border-${color}-500/20`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{miner.model?.display_name || miner.model?.name}</div>
                    <div className="text-xs text-gray-400">{miner.model?.category?.name || "Базовый майнер"}</div>
                  </div>
                  <div className="text-sm bg-gray-700 px-2 py-0.5 rounded">x{miner.quantity}</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Zap size={12} className={`text-${color}-400`} />
                    <span>Мощность: {miner.model?.mining_power || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-400" />
                    <span>Энергия: {miner.model?.energy_consumption || 0}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Сообщение, если у пользователя нет майнеров */}
      {showMiners && miners.length === 0 && (
        <div className="text-center text-gray-400 py-4">У вас пока нет майнеров. Приобретите их в магазине.</div>
      )}
    </div>
  )
}

export default MyMiners

