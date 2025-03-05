"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowUp, Zap, Award, TrendingUp, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

// Защита от свайпа вниз
const SwipeGuard = () => {
  return <div className="swipe-guard" />
}

// Компонент баланса с анимацией
const BalanceCard = ({ balance, currency = "COINS", power = 0 }) => {
  return (
    <motion.div
      className="balance-card card-3d glow-effect"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="hexagon-bg"></div>
      <div className="balance-background"></div>
      <div className="balance-content">
        <div className="balance-label">Ваш баланс</div>
        <motion.div
          className="balance-amount"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {balance}
          <span className="balance-currency">{currency}</span>
        </motion.div>
        <div className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Zap size={16} className="text-blue-400" />
          </motion.div>
          <span className="power-indicator">Мощность: {power} h/s</span>
        </div>
      </div>
    </motion.div>
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

// Компонент достижений
const Achievements = ({ achievements }) => {
  return (
    <div className="bg-opacity-30 bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Award size={18} className="text-blue-400" />
        Достижения
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className={`bg-opacity-40 ${achievement.completed ? "bg-blue-900" : "bg-gray-700"} rounded-lg p-3 flex flex-col items-center text-center`}
          >
            <div
              className={`p-2 rounded-full mb-2 ${achievement.completed ? "bg-blue-500 bg-opacity-30" : "bg-gray-600 bg-opacity-30"}`}
            >
              {achievement.icon}
            </div>
            <div className="font-medium text-sm">{achievement.name}</div>
            <div className="text-xs text-gray-400 mt-1">{achievement.description}</div>
            {achievement.completed && <div className="text-xs text-blue-400 mt-2">Выполнено</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент рейтинга
const RankingPreview = ({ ranking }) => {
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
        <div className="text-center text-sm text-gray-400">До следующего ранга: {ranking.nextRankDifference} монет</div>
      </div>
    </div>
  )
}

// Компонент быстрых действий
const QuickActions = ({ onAction }) => {
  const actions = [
    { id: "shop", label: "Магазин", icon: <Zap size={20} /> },
    { id: "tasks", label: "Задания", icon: <Award size={20} /> },
    { id: "rating", label: "Рейтинг", icon: <TrendingUp size={20} /> },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="button-gradient py-3 px-4 rounded-xl flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="mb-2"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {action.icon}
          </motion.div>
          <div className="text-sm font-medium">{action.label}</div>
        </motion.button>
      ))}
    </div>
  )
}

const Particles = () => {
  const particlesRef = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particleCount = 20

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.animation = `float ${5 + Math.random() * 5}s infinite`
      container.appendChild(particle)
      particlesRef.current.push(particle)
    }

    return () => {
      particlesRef.current.forEach((particle) => particle.remove())
      particlesRef.current = []
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />
}

// Главная страница
const HomePage = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    balance: 0,
    power: 0,
    stats: [
      { label: "Заработано", value: "0" },
      { label: "Майнеров", value: "0" },
      { label: "Рефералов", value: "0" },
      { label: "Дней", value: "0" },
    ],
    miners: [],
    transactions: [],
    achievements: [
      {
        name: "Первый шаг",
        description: "Купите первого майнера",
        completed: false,
        icon: <Zap size={16} className="text-blue-400" />,
      },
      {
        name: "Коллекционер",
        description: "Соберите 5 майнеров",
        completed: false,
        icon: <Award size={16} className="text-gray-400" />,
      },
      {
        name: "Социальная сеть",
        description: "Пригласите 3 друзей",
        completed: false,
        icon: <TrendingUp size={16} className="text-gray-400" />,
      },
      {
        name: "Богатство",
        description: "Заработайте 5000 монет",
        completed: false,
        icon: <Clock size={16} className="text-gray-400" />,
      },
    ],
    ranking: {
      position: 0,
      progress: 0,
      nextRankDifference: 0,
    },
  })

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем текущего пользователя
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Получаем данные пользователя из базы
        const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (userError) throw userError

        // Получаем данные майнеров пользователя
        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select(`
            *,
            model:miner_models (
              id,
              name,
              display_name,
              mining_power,
              energy_consumption
            )
          `)
          .eq("user_id", user.id)
          .order("purchased_at")

        if (minersError) throw minersError

        // Получаем транзакции пользователя
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (transactionsError) throw transactionsError

        // Получаем позицию пользователя в рейтинге
        const { data: ratingData, error: ratingError } = await supabase.rpc("get_user_rating", {
          user_id_param: user.id,
        })

        if (ratingError) throw ratingError

        // Получаем количество рефералов
        const { count: referralsCount, error: referralsError } = await supabase
          .from("referral_users")
          .select("id", { count: "exact" })
          .eq("referrer_id", user.id)

        if (referralsError) throw referralsError

        // Форматируем данные для отображения
        const totalPower = (minersData || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
        const totalEarned = (transactionsData || [])
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0)

        // Проверяем достижения
        const achievements = [
          {
            name: "Первый шаг",
            description: "Купите первого майнера",
            completed: minersData.length > 0,
            icon: <Zap size={16} className={minersData.length > 0 ? "text-blue-400" : "text-gray-400"} />,
          },
          {
            name: "Коллекционер",
            description: "Соберите 5 майнеров",
            completed: minersData.length >= 5,
            icon: <Award size={16} className={minersData.length >= 5 ? "text-blue-400" : "text-gray-400"} />,
          },
          {
            name: "Социальная сеть",
            description: "Пригласите 3 друзей",
            completed: referralsCount >= 3,
            icon: <TrendingUp size={16} className={referralsCount >= 3 ? "text-blue-400" : "text-gray-400"} />,
          },
          {
            name: "Богатство",
            description: "Заработайте 5000 монет",
            completed: totalEarned >= 5000,
            icon: <Clock size={16} className={totalEarned >= 5000 ? "text-blue-400" : "text-gray-400"} />,
          },
        ]

        // Форматируем транзакции
        const formattedTransactions = transactionsData.map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          timestamp: new Date(tx.created_at).getTime(),
        }))

        // Форматируем майнеры
        const formattedMiners = minersData.map((miner) => ({
          name: miner.model.display_name,
          level: miner.level || 1,
          power: miner.model.mining_power * miner.quantity,
          earnings: `+${(miner.model.mining_power * miner.quantity * 0.5).toFixed(1)}`,
        }))

        // Обновляем состояние
        setUserData({
          balance: userData.balance,
          power: totalPower,
          stats: [
            { label: "Заработано", value: totalEarned.toFixed(0) },
            { label: "Майнеров", value: minersData.length.toString() },
            { label: "Рефералов", value: referralsCount.toString() },
            {
              label: "Дней",
              value: Math.floor(
                (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24),
              ).toString(),
            },
          ],
          miners: formattedMiners,
          transactions: formattedTransactions,
          achievements,
          ranking: {
            position: ratingData?.position || 0,
            progress: ratingData?.progress || 0,
            nextRankDifference: ratingData?.next_rank_difference || 100,
          },
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()

    // Обновляем баланс каждую секунду
    const interval = setInterval(() => {
      setUserData((prev) => ({
        ...prev,
        balance: prev.balance + prev.power / 3600, // Увеличиваем баланс каждую секунду
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleQuickAction = (actionId) => {
    navigate(`/${actionId}`)
  }

  return (
    <div className="home-page">
      <SwipeGuard />
      <Particles />

      <motion.div
        className="app-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        <BalanceCard balance={Number.parseFloat(userData.balance.toFixed(2))} power={userData.power} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatsSection stats={userData.stats} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <QuickActions onAction={handleQuickAction} />
        </motion.div>

        <ActiveMiners miners={userData.miners} />

        <RankingPreview ranking={userData.ranking} />

        <RecentTransactions transactions={userData.transactions} />

        <Achievements achievements={userData.achievements} />
      </motion.div>
    </div>
  )
}

export default HomePage

