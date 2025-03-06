"use client"

import { useState, useEffect } from "react"
import { HardDrive, Zap, Battery, Clock, Gauge, ChevronDown, ChevronUp } from "lucide-react"

export const MyMiners = ({ miners = [], miningStats = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  // Подробное логирование для отладки
  useEffect(() => {
    console.log("MyMiners component received miners:", miners)

    if (miners && miners.length > 0) {
      const firstMiner = miners[0]
      console.log("First miner example:", firstMiner)

      // Сохраняем информацию о структуре данных для отображения
      setDebugInfo({
        minerKeys: Object.keys(firstMiner),
        minerExample: JSON.stringify(firstMiner, null, 2),
      })
    }
  }, [miners])

  // Проверка на валидность данных
  const validMiners = Array.isArray(miners) && miners.length > 0

  // Если нет майнеров, показываем сообщение
  if (!validMiners) {
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

  // Форматируем числа
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "0.00"
    return Number.parseFloat(num).toFixed(2)
  }

  // Пытаемся определить общую мощность и потребление
  let totalPower = 0
  let totalConsumption = 0

  // Пробуем разные варианты структуры данных
  miners.forEach((miner) => {
    // Вариант 1: прямые свойства
    if (typeof miner.mining_power === "number" && typeof miner.quantity === "number") {
      totalPower += miner.mining_power * miner.quantity
    }
    // Вариант 2: вложенные свойства
    else if (miner.model && typeof miner.model.mining_power === "number" && typeof miner.quantity === "number") {
      totalPower += miner.model.mining_power * miner.quantity
    }
    // Вариант 3: другие имена свойств
    else if (typeof miner.power === "number" && typeof miner.count === "number") {
      totalPower += miner.power * miner.count
    }
    // Вариант 4: другие имена свойств
    else if (typeof miner.hashrate === "number" && typeof miner.quantity === "number") {
      totalPower += miner.hashrate * miner.quantity
    }

    // Аналогично для потребления энергии
    if (typeof miner.energy_consumption === "number" && typeof miner.quantity === "number") {
      totalConsumption += miner.energy_consumption * miner.quantity
    } else if (
      miner.model &&
      typeof miner.model.energy_consumption === "number" &&
      typeof miner.quantity === "number"
    ) {
      totalConsumption += miner.model.energy_consumption * miner.quantity
    } else if (typeof miner.consumption === "number" && typeof miner.quantity === "number") {
      totalConsumption += miner.consumption * miner.quantity
    } else if (typeof miner.energy === "number" && typeof miner.quantity === "number") {
      totalConsumption += miner.energy * miner.quantity
    }
  })

  // Используем данные из miningStats, если они есть, иначе рассчитываем
  const hourlyIncome = miningStats.hourly_rate || totalPower * 0.5
  const efficiency = totalConsumption > 0 ? totalPower / totalConsumption : 0

  // Функция для получения значения свойства с учетом разных возможных структур
  const getMinerProperty = (miner, propertyNames, defaultValue = 0) => {
    for (const name of propertyNames) {
      // Проверяем прямое свойство
      if (miner[name] !== undefined && miner[name] !== null) {
        return miner[name]
      }

      // Проверяем вложенное свойство model.name
      if (miner.model && miner.model[name] !== undefined && miner.model[name] !== null) {
        return miner.model[name]
      }
    }
    return defaultValue
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

      {/* Список майнеров */}
      {isExpanded && (
        <div className="space-y-2">
          {miners.map((miner, index) => {
            // Пытаемся получить все возможные свойства
            const name = getMinerProperty(miner, ["model_name", "name", "display_name"], `Майнер #${index + 1}`)
            const power = getMinerProperty(miner, ["mining_power", "power", "hashrate"], 0)
            const quantity = getMinerProperty(miner, ["quantity", "count"], 1)
            const consumption = getMinerProperty(miner, ["energy_consumption", "consumption", "energy"], 0)

            return (
              <div key={miner.id || index} className="bg-[#1A2234] rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0F1729] rounded-full flex items-center justify-center">
                      <HardDrive size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white">{name}</div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(power)} H/s × {quantity} шт.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{formatNumber(power * quantity)} H/s</div>
                    <div className="text-xs text-gray-400">{formatNumber(consumption * quantity)} W</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Отладочная информация */}
      {isExpanded && debugInfo && (
        <div className="mt-3 p-2 bg-[#1A2234] rounded-lg text-xs text-gray-400">
          <div>Доступные свойства майнера: {debugInfo.minerKeys.join(", ")}</div>
          <pre className="mt-1 overflow-x-auto">{debugInfo.minerExample}</pre>
        </div>
      )}
    </div>
  )
}

export default MyMiners

