"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { User, Hash, Zap, Pickaxe } from "lucide-react"
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
    <div className="min-h-screen bg-[#0d1117]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto p-4 flex flex-col gap-4"
      >
        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-[#161b22] border border-[#30363d]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {telegramUser.photoUrl ? (
                  <img
                    src={telegramUser.photoUrl || "/placeholder.svg"}
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#30363d]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#21262d] flex items-center justify-center border-2 border-[#30363d]">
                    <User className="w-8 h-8 text-[#8b949e]" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d1117]" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">{telegramUser.firstName}</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262d] w-fit">
                  <Hash className="w-4 h-4 text-[#8b949e]" />
                  <span className="font-mono text-sm font-medium text-[#8b949e]">{telegramUser.id}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-[#8b949e] text-sm mb-2">Баланс</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {user.balance.toFixed(2)}
                <span className="text-lg">💎</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-[#8b949e] text-sm mb-2">Мощность</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {totalMiningPower.toFixed(3)}
                <span className="text-lg">⚡</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-[#8b949e] text-sm mb-2">Всего добыто</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {stats?.total_mined?.toFixed(2) || "0.00"}
                <span className="text-lg">💎</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-[#8b949e] text-sm mb-2">Майнингов</div>
              <div className="text-2xl font-bold text-white">{stats?.mining_count || "0"}</div>
            </div>
          </motion.div>
        </div>

        {/* Miners List */}
        {miners.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden"
          >
            <div className="p-4 border-b border-[#30363d] flex items-center gap-3">
              <Pickaxe className="w-5 h-5 text-[#8b949e]" />
              <h3 className="font-medium text-white">Ваши майнеры</h3>
            </div>
            <div className="divide-y divide-[#30363d]">
              {miners.map((miner) => (
                <motion.div
                  key={miner.id}
                  variants={itemVariants}
                  className="p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-[#8b949e]" />
                    <span className="text-white">{miner.model.display_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8b949e]">{miner.model.mining_power} ⚡</span>
                    <span className="px-2 py-1 rounded-md bg-[#21262d] text-[#8b949e] text-sm">x{miner.quantity}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

