"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { User, Sparkles, Zap, Pickaxe, Hash } from "lucide-react"
import { useTelegramUser } from "../utils/telegram"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

export function UserProfile({ user }) {
  const [stats, setStats] = useState(null)
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const telegramUser = useTelegramUser()

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        const { data: statsData, error: statsError } = await supabase
          .from("mining_stats")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (statsError && statsError.code !== "PGRST116") {
          console.error("Error loading stats:", statsError)
          throw statsError
        }

        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select(`
            *,
            model:miner_models (
              display_name,
              mining_power
            )
          `)
          .eq("user_id", user.id)

        if (minersError) {
          console.error("Error loading miners:", minersError)
          throw minersError
        }

        setStats(statsData || { total_mined: 0, mining_count: 0 })
        setMiners(minersData || [])
      } catch (err) {
        console.error("Error loading user data:", err)
        setError("Ошибка загрузки данных пользователя")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse w-8 h-8 rounded-full bg-blue-500/20" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse w-8 h-8 rounded-full bg-blue-500/20" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
  }

  const totalMiningPower = miners.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="profile-container max-w-md mx-auto h-screen flex flex-col"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 mb-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="relative p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {telegramUser.photoUrl ? (
                <img
                  src={telegramUser.photoUrl || "/placeholder.svg"}
                  alt={telegramUser.displayName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-700/50 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-700/50 shadow-lg">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                {telegramUser.firstName}
              </h2>
              {telegramUser.username && (
                <p className="text-sm text-gray-400 font-medium truncate">@{telegramUser.username}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card group hover:border-blue-500/30 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="stat-label">Баланс</div>
          </div>
          <div className="stat-value group-hover:text-blue-400 transition-colors duration-300">
            {user.balance.toFixed(2)} 💎
          </div>
        </div>

        <div className="stat-card group hover:border-purple-500/30 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="stat-label">Мощность</div>
          </div>
          <div className="stat-value group-hover:text-purple-400 transition-colors duration-300">
            {totalMiningPower.toFixed(3)} ⚡
          </div>
        </div>

        <div className="stat-card group hover:border-indigo-500/30 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Pickaxe className="w-4 h-4" />
            </div>
            <div className="stat-label">Всего добыто</div>
          </div>
          <div className="stat-value group-hover:text-indigo-400 transition-colors duration-300">
            {stats?.total_mined?.toFixed(2) || "0.00"} 💎
          </div>
        </div>

        <div className="stat-card group hover:border-cyan-500/30 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Hash className="w-4 h-4" />
            </div>
            <div className="stat-label">Кол-во майнингов</div>
          </div>
          <div className="stat-value group-hover:text-cyan-400 transition-colors duration-300">
            {stats?.mining_count || "0"}
          </div>
        </div>
      </motion.div>

      {/* Miners List */}
      {miners.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="miners-summary hover:border-gray-600/50 transition-colors duration-300 flex-1 overflow-auto"
        >
          <h3 className="flex items-center gap-2 text-gray-300 text-sm">
            <Pickaxe className="w-4 h-4" />
            Ваши майнеры
          </h3>
          <div className="miners-list mt-3">
            {miners.map((miner, index) => (
              <motion.div
                key={miner.id}
                variants={itemVariants}
                custom={index}
                className="miner-item group hover:bg-gray-800/30 rounded-lg transition-colors duration-300"
              >
                <span className="group-hover:text-blue-400 transition-colors duration-300">
                  {miner.model.display_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{miner.model.mining_power} ⚡</span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-sm">x{miner.quantity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

