"use client"

import { useState, useEffect } from "react"
import { ArrowUp, Zap, Award, Clock, User, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

// Защита от свайпа вниз
const SwipeGuard = () => {
  return <div className="swipe-guard" />
}

// Добавим функции для работы с рангами
const getUserRank = (balance, ranks) => {
  if (!ranks || ranks.length === 0) {
    return { name: "Новичок", min_balance: 0, color: "#94a3b8" }
  }

  // Находим самый высокий ранг, которому соответствует баланс
  let userRank = ranks[0] // По умолчанию - первый ранг

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (balance >= ranks[i].min_balance) {
      userRank = ranks[i]
      break
    }
  }

  return userRank
}

const getNextRankInfo = (balance, ranks) => {
  if (!ranks || ranks.length === 0) {
    return {
      currentRank: { name: "Новичок", min_balance: 0, color: "#94a3b8" },
      nextRank: null,
      progress: 0,
      nextRankDifference: 100,
    }
  }

  const currentRank = getUserRank(balance, ranks)
  const currentRankIndex = ranks.findIndex((rank) => rank.id === currentRank.id)

  // Если пользователь уже на максимальном ранге
  if (currentRankIndex === ranks.length - 1) {
    return {
      currentRank,
      nextRank: null,
      progress: 100,
      nextRankDifference: 0,
    }
  }

  const nextRank = ranks[currentRankIndex + 1]
  const totalNeeded = nextRank.min_balance - currentRank.min_balance
  const currentProgress = balance - currentRank.min_balance
  const progress = Math.min(100, Math.floor((currentProgress / totalNeeded) * 100))
  const nextRankDifference = nextRank.min_balance - balance

  return {
    currentRank,
    nextRank,
    progress,
    nextRankDifference,
  }
}

// Компонент баланса с анимацией
const BalanceCard = ({ balance, currency = "COINS", power = 0 }) => {
  const [showIncrease, setShowIncrease] = useState(false)
  const [lastBalance, setLastBalance] = useState(balance)

  useEffect(() => {
    if (balance > lastBalance) {
      setShowIncrease(true)
      const timer = setTimeout(() => setShowIncrease(false), 2000)
      return () => clearTimeout(timer)
    }
    setLastBalance(balance)
  }, [balance, lastBalance])

  return (
    <div className="balance-card">
      <div className="balance-background"></div>
      <div className="balance-content">
        <div className="balance-label">Ваш баланс</div>
        <div className="balance-amount">
          {balance}
          <span className="balance-currency">{currency}</span>
          {showIncrease && <div className="balance-increase">+{(balance - lastBalance).toFixed(2)}</div>}
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
        <Award size={18} className="text-blue-400" />
        Ваш ранг
      </h3>
      <div className="bg-opacity-40 bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">Текущий ранг</div>
          <div className="font-bold text-xl" style={{ color: ranking.currentRank.color }}>
            {ranking.currentRank.name}
          </div>
        </div>

        {ranking.nextRank && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Прогресс до {ranking.nextRank.name}</span>
                <span>{ranking.progress}%</span>
              </div>
              <div className="progress-wrapper">
                <div
                  className="progress-bar"
                  style={{
                    width: `${ranking.progress}%`,
                    height: "8px",
                    borderRadius: "4px",
                    background: `linear-gradient(90deg, ${ranking.currentRank.color}, ${ranking.nextRank.color})`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 mb-3">
              До следующего ранга: {ranking.nextRankDifference} монет
            </div>
          </>
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">Позиция в рейтинге</div>
          <div className="font-bold text-xl">{ranking.position || "N/A"}</div>
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

// Компонент рефералов
const ReferralsPreview = ({ referrals, userId, onViewReferrals }) => {
  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Users size={18} className="text-blue-400" />
        Рефералы
      </h3>
      <div className="bg-opacity-40 bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">Всего рефералов</div>
          <div className="font-bold text-xl">{referrals.count || 0}</div>
        </div>

        <div className="text-center text-sm text-gray-400 mb-3">
          Заработано с рефералов: {referrals.earned || 0} монет
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Ваша реферальная ссылка:</div>
          <div className="bg-opacity-20 bg-gray-600 p-2 rounded-lg text-xs break-all">
            https://t.me/YourBotName?start={userId}
          </div>
        </div>

        <button
          onClick={onViewReferrals}
          className="w-full py-2 px-4 bg-blue-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-blue-400 text-sm font-medium"
        >
          Подробнее о реферальной программе
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
    { id: "miners", label: "Майнеры", icon: <User size={20} /> },
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
const HomePage = ({ user, balance, minersData, ratingData, transactionsData, ranksData }) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    balance: balance || 0,
    power: minersData?.totalPower || 0,
    stats: [
      { label: "Заработано", value: "0" },
      { label: "Майнеров", value: (minersData?.miners?.length || 0).toString() },
      { label: "Рефералов", value: "0" },
      { label: "Дней", value: "0" },
    ],
    miners: [],
    transactions: [],
    ranking: {
      position: 0,
      currentRank: { name: "Новичок", color: "#94a3b8" },
      nextRank: null,
      progress: 0,
      nextRankDifference: 100,
    },
    referrals: {
      count: 0,
      earned: 0,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загрузка данных о рефералах
  useEffect(() => {
    if (user?.id) {
      const loadReferrals = async () => {
        try {
          // Получаем количество рефералов
          const { data: referralsCount, error: countError } = await supabase
            .from("referral_users")
            .select("id", { count: "exact" })
            .eq("referrer_id", user.id)

          if (countError) throw countError

          // Получаем сумму заработанного с рефералов
          const { data: transactions, error: txError } = await supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("type", "referral_reward")

          if (txError) throw txError

          const earned = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

          setUserData((prev) => ({
            ...prev,
            referrals: {
              count: referralsCount?.length || 0,
              earned: earned,
            },
          }))
        } catch (error) {
          console.error("Error loading referrals data:", error)
        }
      }

      loadReferrals()
    }
  }, [user?.id])

  // Обновляем данные при изменении пропсов
  useEffect(() => {
    if (user && balance !== undefined && minersData && ranksData?.ranks) {
      console.log("Updating home page data from props:", { user, balance, minersData, ranksData })

      // Получаем информацию о ранге из базы данных
      const rankInfo = getNextRankInfo(balance, ranksData.ranks)

      // Форматируем майнеры
      const formattedMiners = (minersData.miners || []).map((miner) => ({
        name: miner.model?.display_name || "Майнер",
        level: miner.level || 1,
        power: miner.model?.mining_power * miner.quantity || 0,
        earnings: `+${((miner.model?.mining_power * miner.quantity || 0) * 0.5).toFixed(1)}`,
      }))

      // Обновляем состояние
      setUserData((prev) => ({
        ...prev,
        balance: balance,
        power: minersData.totalPower || 0,
        stats: [
          { label: "Заработано", value: user.total_earned?.toFixed(0) || "0" },
          { label: "Майнеров", value: (minersData.miners?.length || 0).toString() },
          { label: "Рефералов", value: prev.referrals.count.toString() },
          {
            label: "Дней",
            value: Math.floor(
              (Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24),
            ).toString(),
          },
        ],
        miners: formattedMiners,
        ranking: {
          ...rankInfo,
          position: prev.ranking.position,
        },
      }))
    }
  }, [user, balance, minersData, ranksData])

  // Обновляем рейтинг при изменении данных рейтинга
  useEffect(() => {
    if (ratingData?.users && user) {
      // Находим позицию пользователя в рейтинге
      const userPosition = ratingData.users.findIndex((u) => u.id === user.id) + 1

      setUserData((prev) => ({
        ...prev,
        ranking: {
          ...prev.ranking,
          position: userPosition || 0,
        },
      }))
    }
  }, [ratingData, user])

  // Обновляем транзакции при изменении данных транзакций
  useEffect(() => {
    if (transactionsData?.transactions) {
      setUserData((prev) => ({
        ...prev,
        transactions: transactionsData.transactions,
      }))
    }
  }, [transactionsData])

  // Имитация обновления баланса
  useEffect(() => {
    const interval = setInterval(() => {
      setUserData((prev) => {
        const newBalance = prev.balance + prev.power / 3600 // Увеличиваем баланс каждую секунду
        // Обновляем информацию о ранге при изменении баланса
        const rankInfo = ranksData?.ranks ? getNextRankInfo(newBalance, ranksData.ranks) : prev.ranking

        return {
          ...prev,
          balance: newBalance,
          ranking: {
            ...rankInfo,
            position: prev.ranking.position,
          },
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [ranksData])

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

        <ReferralsPreview
          referrals={userData.referrals}
          userId={user?.telegram_id}
          onViewReferrals={() => navigate("/profile")}
        />

        <RecentTransactions transactions={userData.transactions} />
      </div>
    </div>
  )
}

// Добавляем экспорт по умолчанию
export default HomePage

