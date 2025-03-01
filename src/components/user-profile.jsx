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
      className="profile-container max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 mb-3"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="relative p-3">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              {telegramUser.photoUrl ? (
                <img
                  src={telegramUser.photoUrl || "/placeholder.svg"}
                  alt={telegramUser.displayName}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-gray-700/50 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-700/50 shadow-lg">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 shadow-lg" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate mb-0.5">
                  {telegramUser.firstName}
                </h2>
                {telegramUser.username && (
                  <p className="text-sm text-gray-400 font-medium truncate mb-1.5">@{telegramUser.username}</p>
                )}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 w-fit">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono text-xs font-medium text-indigo-300">{telegramUser.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="stat-card group">
          <div className="flex items-center gap-2">
            <div className="stat-icon-wrapper bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Баланс</div>
              <div className="stat-value group-hover:text-blue-400">
                {user.balance.toFixed(2)} <span className="stat-symbol">💎</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-2">
            <div className="stat-icon-wrapper bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Мощность</div>
              <div className="stat-value group-hover:text-purple-400">
                {totalMiningPower.toFixed(3)} <span className="stat-symbol">⚡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-2">
            <div className="stat-icon-wrapper bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/20">
              <Pickaxe className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Всего добыто</div>
              <div className="stat-value group-hover:text-indigo-400">
                {stats?.total_mined?.toFixed(2) || "0.00"} <span className="stat-symbol">💎</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-2">
            <div className="stat-icon-wrapper bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-cyan-500/20">
              <Hash className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Кол-во майнингов</div>
              <div className="stat-value group-hover:text-cyan-400">{stats?.mining_count || "0"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Miners List */}
      {miners.length > 0 && (
        <motion.div variants={itemVariants} className="miners-summary flex-1 overflow-auto">
          <div className="flex items-center gap-2 mb-3 px-3">
            <div className="p-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50">
              <Pickaxe className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Ваши майнеры</h3>
          </div>
          <div className="miners-list">
            {miners.map((miner, index) => (
              <motion.div key={miner.id} variants={itemVariants} custom={index} className="miner-item group">
                <span className="font-medium group-hover:text-blue-400">{miner.model.display_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{miner.model.mining_power} ⚡</span>
                  <span className="miner-quantity">x{miner.quantity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

