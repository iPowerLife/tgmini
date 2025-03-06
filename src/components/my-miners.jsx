"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Cpu, Zap, Flame } from "lucide-react"

export const MyMiners = ({ miners = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Рассчитываем общую мощность майнеров
  const totalPower = miners.reduce((sum, miner) => sum + (miner.model?.mining_power || 0) * (miner.quantity || 1), 0)

  // Определяем, сколько майнеров показывать в свернутом состоянии
  const visibleMiners = isExpanded ? miners : miners.slice(0, 2)

  // Определяем цветовую схему для категории майнера
  const getCategoryColor = (miner) => {
    const categoryName = miner.model?.category?.name?.toLowerCase() || ""

    if (categoryName.includes("basic") || categoryName.includes("базов")) {
      return "blue"
    } else if (categoryName.includes("advanced") || categoryName.includes("продвинут")) {
      return "purple"
    } else if (categoryName.includes("premium") || categoryName.includes("премиум")) {
      return "yellow"
    }

    return "blue" // По умолчанию
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={18} />
          <span className="font-medium">Мои майнеры</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {miners.length} шт. / {totalPower} мощность
          </span>
        </div>
      </div>

      {miners.length > 0 ? (
        <>
          <div className="space-y-2 mb-2">
            {visibleMiners.map((miner) => {
              const color = getCategoryColor(miner)

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

          {miners.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1 text-sm text-blue-400 bg-gray-800 rounded-lg py-2 hover:bg-gray-750 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  <span>Свернуть</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Показать все ({miners.length})</span>
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 py-6">У вас пока нет майнеров. Приобретите их в магазине.</div>
      )}
    </div>
  )
}

export default MyMiners

