"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Zap, Award, TrendingUp, Clock, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

// Защита от свайпа вниз
const SwipeGuard = () => {
  return <div className="swipe-guard" />
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
    <motion.div className="balance-card" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
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
          {showIncrease && <div className="balance-increase">+{(balance - lastBalance).toFixed(2)}</div>}
        </motion.div>
        <div className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Zap size={16} className="text-blue-400" />
          </motion.div>
          <span>Мощность: {power} h/s</span>
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
        <motion.div
          key={index}
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </motion.div>
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
          <motion.div
            key={index}
            className="bg-opacity-40 bg-gray-700 rounded-lg p-3 flex justify-between items-center"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div>
              <div className="font-medium">{miner.name}</div>
              <div className="text-sm text-gray-400">Уровень: {miner.level}</div>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-medium">{miner.power} h/s</div>
              <div className="text-xs text-gray-400">{miner.earnings}/час</div>
            </div>
          </motion.div>
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
          <motion.div
            key={index}
            className="bg-opacity-40 bg-gray-700 rounded-lg p-2 flex justify-between items-center"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
            initial={{ opacity: 0, x: tx.amount > 0 ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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
          </motion.div>
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
            <motion.div
              className="progress-bar"
              style={{ width: `${ranking.progress}%`, height: "8px", borderRadius: "4px" }}
              initial={{ width: "0%" }}
              animate={{ width: `${ranking.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mb-3">
          До следующего ранга: {ranking.nextRankDifference} монет
        </div>
        <motion.button
          onClick={onViewRating}
          className="w-full py-2 px-4 bg-blue-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-blue-400 text-sm font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Посмотреть полный рейтинг
        </motion.button>
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
    ranking: {
      position: 0,
      progress: 0,
      nextRankDifference: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Получаем текущего пользователя из Supabase
        const { data: authData, error: authError } = await supabase.auth.getSession()

        if (authError) throw authError

        // Если пользователь не авторизован, используем данные из Telegram
        const userId = authData?.session?.user?.id

        if (!userId) {
          console.log("Пользователь не авторизован, используем данные из localStorage")
          // Получаем данные из localStorage или используем значения по умолчанию
          const storedData = localStorage.getItem("userData")
          if (storedData) {
            setUserData(JSON.parse(storedData))
          }
          setLoading(false)
          return
        }

        // Получаем данные пользователя из базы
        const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

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
          .eq("user_id", userId)
          .order("purchased_at")

        if (minersError) throw minersError

        // Получаем транзакции пользователя
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (transactionsError) throw transactionsError

        // Получаем позицию пользователя в рейтинге
        const { data: ratingData, error: ratingError } = await supabase.rpc("get_user_rating", {
          user_id_param: userId,
        })

        if (ratingError) throw ratingError

        // Получаем количество рефералов
        const { count: referralsCount, error: referralsError } = await supabase
          .from("referral_users")
          .select("id", { count: "exact" })
          .eq("referrer_id", userId)

        if (referralsError) throw referralsError

        // Форматируем данные для отображения
        const totalPower = (minersData || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
        const totalEarned = (transactionsData || [])
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0)

        // Форматируем транзакции
        const formattedTransactions = (transactionsData || []).map((tx) => ({
          description: tx.description || "Транзакция",
          amount: tx.amount,
          timestamp: new Date(tx.created_at).getTime(),
        }))

        // Форматируем майнеры
        const formattedMiners = (minersData || []).map((miner) => ({
          name: miner.model.display_name || "Майнер",
          level: miner.level || 1,
          power: miner.model.mining_power * miner.quantity,
          earnings: `+${(miner.model.mining_power * miner.quantity * 0.5).toFixed(1)}`,
        }))

        // Обновляем состояние
        const updatedUserData = {
          balance: userData.balance || 0,
          power: totalPower,
          stats: [
            { label: "Заработано", value: totalEarned.toFixed(0) },
            { label: "Майнеров", value: (minersData || []).length.toString() },
            { label: "Рефералов", value: referralsCount.toString() },
            {
              label: "Дней",
              value: Math.floor(
                (Date.now() - new Date(userData.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24),
              ).toString(),
            },
          ],
          miners: formattedMiners,
          transactions: formattedTransactions,
          ranking: {
            position: ratingData?.position || 0,
            progress: ratingData?.progress || 0,
            nextRankDifference: ratingData?.next_rank_difference || 100,
          },
        }

        setUserData(updatedUserData)

        // Сохраняем данные в localStorage для быстрой загрузки в будущем
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Обновляем баланс каждую секунду
    const interval = setInterval(() => {
      setUserData((prev) => {
        const newBalance = prev.balance + prev.power / 3600 // Увеличиваем баланс каждую секунду
        return {
          ...prev,
          balance: newBalance,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleQuickAction = (actionId) => {
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <ActiveMiners miners={userData.miners} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <RankingPreview ranking={userData.ranking} onViewRating={() => navigate("/rating")} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <RecentTransactions transactions={userData.transactions} />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HomePage

