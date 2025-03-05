"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronDown, Users, Cpu, Zap, BarChart3, Server, CheckCircle2 } from "lucide-react"

// Компонент таймера обратного отсчета
const CountdownTimer = ({ targetTime }) => {
  const [timeLeft, setTimeLeft] = useState("00:00:00")

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetTime - now

      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft("00:00:00")
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTime])

  return timeLeft
}

// Компонент периода сбора
const CollectionPeriod = ({ hours, amount, isActive }) => (
  <div className={`p-3 rounded-xl ${isActive ? "bg-green-950" : "bg-gray-800"}`}>
    <div className="text-center font-medium">{hours}ч</div>
    <div className={`text-sm ${isActive ? "text-green-500" : "text-gray-400"}`}>≈{amount}</div>
  </div>
)

// Компонент блока сбора наград
const RewardsCollection = ({ hashrate, efficiency, rewards }) => {
  const nextCollection = new Date().getTime() + 15 * 60 * 1000 // +15 минут для примера

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock className="text-green-500" size={20} />
          <span className="font-medium">Сбор наград</span>
        </div>
        <span className="text-green-500 text-sm">Доступно</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Хешрейт</div>
          <div className="font-medium">{hashrate} TH/s</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Эффективность</div>
          <div className="font-medium">{efficiency}%</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {rewards.map((reward, index) => (
          <CollectionPeriod key={index} hours={reward.hours} amount={reward.amount} isActive={reward.hours === 4} />
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Следующий сбор через</span>
          <CountdownTimer targetTime={nextCollection} />
        </div>
        <div className="bg-gray-800 rounded-full h-1">
          <div className="bg-green-500 h-1 rounded-full" style={{ width: "75%" }}></div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-green-500">
          <Zap size={16} />
          <span>≈739 монет</span>
        </div>
        <button className="bg-green-500 text-black font-medium px-6 py-2 rounded-lg">Забрать</button>
      </div>
    </div>
  )
}

// Обновленный компонент общей статистики
const Statistics = ({ minersData }) => {
  const totalHashrate = minersData?.totalPower || 0
  const minersCount = minersData?.miners?.length || 0

  // Вычисляем средний хешрейт, если есть майнеры
  const averageHashrate = minersCount > 0 ? totalHashrate / minersCount : 0

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-gray-400" size={20} />
          <span className="font-medium">Общая статистика</span>
        </div>
        <span className="text-gray-400 text-sm">Обновлено</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Zap size={14} />
            <span>Текущий хешрейт</span>
            <span className="text-green-500">+2.5%</span>
          </div>
          <div className="font-medium">{totalHashrate} h/s</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Clock size={14} />
            <span>Средний хешрейт</span>
            <span className="text-green-500">±5%</span>
          </div>
          <div className="font-medium">{averageHashrate.toFixed(1)} h/s</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <Server size={14} />
          <span>Майнеров</span>
        </div>
        <div className="font-medium">{minersCount}</div>
      </div>
    </div>
  )
}

// Компонент пула майнинга
const MiningPool = ({ pools, selectedPool }) => (
  <div className="bg-gray-900 rounded-2xl p-4 mb-4">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Users className="text-blue-400" size={20} />
        <span className="font-medium">Майнинг пулы</span>
      </div>
    </div>

    <div className="text-sm text-gray-400 mb-4">Выберите пул для майнинга</div>

    <div className="flex gap-2 mb-4">
      {["Стандартный", "Продвинутый", "Премиум"].map((type, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-lg ${type === "Стандартный" ? "bg-gray-800 text-white" : "text-gray-400"}`}
        >
          {type}
        </button>
      ))}
    </div>

    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">Standard Pool</span>
        <span className="text-blue-400 text-sm">3,240 майнеров</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Хешрейт пула</div>
          <div className="font-medium">45.8 PH/s</div>
          <div className="text-green-500 text-sm">+1.2%</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Эффективность</div>
          <div className="font-medium">98%</div>
          <div className="text-green-500 text-sm">+0.5%</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Комиссия</div>
          <div className="font-medium">1%</div>
          <div className="text-gray-400 text-sm">фиксированная</div>
        </div>
      </div>
    </div>
  </div>
)

// Компонент майнеров
const Miners = ({ miners }) => (
  <div className="bg-gray-900 rounded-2xl p-4">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Server className="text-blue-400" size={20} />
        <span className="font-medium">Basic Miners</span>
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-400">
        1 устройств
        <ChevronDown size={16} />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <div className="text-gray-400 text-sm mb-1">Общий хешрейт</div>
        <div className="font-medium">25 TH/s</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Эффективность</div>
        <div className="font-medium">92.0%</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <div className="text-gray-400 text-sm mb-1">Мощность</div>
        <div className="font-medium">2.2 kW</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Средний хешрейт</div>
        <div className="flex items-center gap-1">
          <Cpu size={14} className="text-gray-400" />
          <span className="font-medium">25.0 TH/s</span>
        </div>
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Эффективность</div>
        <div className="flex items-center gap-1">
          <Zap size={14} className="text-gray-400" />
          <span className="font-medium">92.0%</span>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="font-medium">Basic Miner I</div>
          <div className="text-gray-400 text-sm">ID: 1</div>
        </div>
        <div className="flex items-center gap-1 text-green-500 text-sm">
          <CheckCircle2 size={16} />
          <span>Активен</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Хешрейт</div>
          <div className="font-medium">25 TH/s</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Мощность</div>
          <div className="font-medium">2.2 kW</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Эффективность</div>
          <div className="font-medium">92%</div>
        </div>
      </div>
    </div>
  </div>
)

// Обновленная главная страница
const HomePage = ({ user, balance, minersData, ratingData, transactionsData, ranksData }) => {
  // Данные для примера
  const rewardsData = [
    { hours: 4, amount: 739 },
    { hours: 8, amount: 3255 },
    { hours: 12, amount: 7768 },
    { hours: 24, amount: 35512 },
  ]

  return (
    <div className="home-page">
      <div className="app-container">
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        <RewardsCollection hashrate={minersData?.totalPower || 0} efficiency={85} rewards={rewardsData} />

        <Statistics minersData={minersData} />

        <MiningPool />

        <Miners />
      </div>
    </div>
  )
}

export default HomePage

