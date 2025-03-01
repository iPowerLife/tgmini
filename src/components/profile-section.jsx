"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

const defaultAvatarUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HBbqrq4vYGEUiT5pYreSYKRv9i1Y7a.png"

export function ProfileSection({ user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse w-8 h-8 rounded-full bg-blue-500/20" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
      <div className="flex items-start gap-4 mb-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          <img
            src={profile?.avatar_url || defaultAvatarUrl}
            alt="Profile"
            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-700/50"
            onError={(e) => {
              e.target.src = defaultAvatarUrl
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800" />
        </motion.div>

        <div className="flex-1">
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-bold text-white mb-1"
          >
            {profile?.nickname || "Meme AirDrop Manager"}
          </motion.h2>
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gray-400"
          >
            ID: {user?.id?.slice(-4) || "####"}
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/30"
        >
          <p className="text-2xl font-bold text-white mb-1">{profile?.balance?.toFixed(2) || "0.00"}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Баланс 💎</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/30"
        >
          <p className="text-2xl font-bold text-white mb-1">{profile?.power?.toFixed(3) || "0.000"}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Мощность ⚡</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/30"
        >
          <p className="text-2xl font-bold text-white mb-1">{profile?.total_mined?.toFixed(2) || "0.00"}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Всего добыто 💎</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/30"
        >
          <p className="text-2xl font-bold text-white mb-1">{profile?.miners_count || "0"}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Кол-во майнингов</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl bg-gray-900/50 border border-gray-700/30 p-4"
      >
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Ваши майнеры</h3>
        <div className="space-y-2">
          {profile?.miners?.map((miner, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0"
            >
              <span className="text-white">{miner.name}</span>
              <span className="text-gray-400">x{miner.count}</span>
            </div>
          )) || <div className="text-gray-500 text-sm">У вас пока нет майнеров</div>}
        </div>
      </motion.div>
    </div>
  )
}

