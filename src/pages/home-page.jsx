"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Zap, Award, TrendingUp, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Защита от свайпа вниз
const SwipeGuard = () => {
  return <div className="swipe-guard" />
}

// Компонент баланса с анимацией
const BalanceCard = ({ balance, currency = "COINS", power = 0 }) => {
  return (
    <div className="balance-card">
      <div className="balance-background"></div>
      <div className="balance-content">
        <div className="balance-label">Ваш баланс</div>
        <div className="balance-amount">
          {balance}
          <span className="balance-currency">{currency}</span>
        </div>
        <div className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
          <Zap size={16} className="text-blue-400" />
          <span>Мощность: {power} h/s</span>
        </div>
      </div>
    </div>
  )
}

// Компонент статистики
const StatsSection = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Компонент активных майнеров
const ActiveMiners = ({ miners }) => {
  if (!miners || miners.length === 0) {
    return (
      <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap size={18} className="text-blue-400" />
          Активные майнеры
        </h3>
        <div className="text-center py-4 text-gray-400">
          У вас пока нет майнеров. Посетите магазин, чтобы приобрести первого майнера!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap size={18} className="text-blue-400" />
        Активные майнеры
      </h3>
      <div className="space-y-3">
        {miners.map((miner, index) => (
          <div key={index} className="bg-opacity-40 bg-gray-700 rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{miner.name}</div>
              <div className="text-sm text-gray-400">Уровень: {miner.level}</div>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-medium">{miner.power} h/s</div>
              <div className="text-xs text-gray-400">{miner.earnings}/час</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент последних транзакций
const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Последние транзакции
        </h3>
        <div className="text-center py-4 text-gray-400">
          У вас пока нет транзакций. Начните майнить, чтобы увидеть историю транзакций!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Clock size={18} className="text-blue-400" />
        Последние транзакции
      </h3>
      <div className="space-y-2">
        {transactions.map((tx, index) => (
          <div key={index} className="bg-opacity-40 bg-gray-700 rounded-lg p-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className={`p-1 rounded-full ${tx.amount > 0 ? "bg-green-500 bg-opacity-20" : "bg-red-500 bg-opacity-20"}`}
              >
                {tx.amount > 0 ? (
                  <ArrowUp size={14} className="text-green-400" />
                ) : (
                  <ArrowUp size={14} className="text-red-400 transform rotate-180" />
                )}
              </div>
              <div className="text-sm">{tx.description}</div>
            </div>
            <div className={`font-medium ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
              {tx.amount > 0 ? "+" : ""}
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент рейтинга
const RankingPreview = ({ ranking, onViewRating }) => {
  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <TrendingUp size={18} className="text-blue-400" />
        Ваш рейтинг
      </h3>
      <div className="bg-opacity-40 bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">Позиция</div>
          <div className="font-bold text-xl">{ranking.position}</div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Прогресс до следующего ранга</span>
            <span>{ranking.progress}%</span>
          </div>
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              style={{ width: `${ranking.progress}%`, height: "8px", borderRadius: "4px" }}
            ></div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mb-3">
          До следующего ранга: {ranking.nextRankDifference} монет
        </div>
        <button
          onClick={onViewRating}
          className="w-full py-2 px-4 bg-blue-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-blue-400 text-sm font-medium"
        >
          Посмотреть полный рейтинг
        </button>
      </div>
    </div>
  )
}

// Компонент быстрых действий
const QuickActions = ({ onAction }) => {
  const actions = [
    { id: "shop", label: "Магазин", icon: <Zap size={20} /> },
    { id: "tasks", label: "Задания", icon: <Award size={20} /> },
    { id: "miners", label: "Майнеры", icon: <TrendingUp size={20} /> },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="button-gradient py-3 px-4 rounded-xl flex flex-col items-center"
        >
          <div className="mb-2">{action.icon}</div>
          <div className="text-sm font-medium">{action.label}</div>
        </button>
      ))}
    </div>
  )
}

// Главная страница
const HomePage = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    balance: 1250,
    power: 125,
    stats: [
      { label: "Заработано", value: "2,450" },
      { label: "Майнеров", value: "3" },
      { label: "Рефералов", value: "2" },
      { label: "Дней", value: "7" },
    ],
    miners: [
      { name: "Basic Miner", level: 2, power: 50, earnings: "+25" },
      { name: "Advanced Miner", level: 1, power: 75, earnings: "+40" },
    ],
    transactions: [
      { description: "Майнинг", amount: 25, timestamp: Date.now() - 3600000 },
      { description: "Покупка майнера", amount: -500, timestamp: Date.now() - 86400000 },
      { description: "Реферальный бонус", amount: 100, timestamp: Date.now() - 172800000 },
    ],
    ranking: {
      position: 42,
      progress: 65,
      nextRankDifference: 350,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Имитация обновления баланса
  useEffect(() => {
    const interval = setInterval(() => {
      setUserData((prev) => ({
        ...prev,
        balance: prev.balance + prev.power / 3600, // Увеличиваем баланс каждую секунду
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleQuickAction = (actionId) => {
    console.log(`Quick action clicked: ${actionId}`)
    navigate(`/${actionId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded-lg text-white">
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="home-page">
      <SwipeGuard />

      <div className="app-container">
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        <BalanceCard balance={Number.parseFloat(userData.balance.toFixed(2))} power={userData.power} />

        <StatsSection stats={userData.stats} />

        <QuickActions onAction={handleQuickAction} />

        <ActiveMiners miners={userData.miners} />

        <RankingPreview ranking={userData.ranking} onViewRating={() => navigate("/rating")} />

        <RecentTransactions transactions={userData.transactions} />
      </div>
    </div>
  )
}

export default HomePage

