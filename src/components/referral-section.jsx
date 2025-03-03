"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { Users, Share2 } from "lucide-react"

export const ReferralSection = ({ user }) => {
  const [referralStats, setReferralStats] = useState({
    totalReferrals: user.referral_count || 0,
    referralLink: `https://t.me/trteeeeeee_bot?start=${user.id}`,
    rewards: 0,
  })

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        // Получаем статистику по рефералам
        const { data: referralData, error: referralError } = await supabase
          .from("referral_users")
          .select("*")
          .eq("referrer_id", user.id)

        if (referralError) throw referralError

        // Получаем сумму наград за рефералов
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("tasks")
          .select("reward")
          .eq("type", "referral")
          .eq("is_completed", true)
          .eq("reward_claimed", true)

        if (rewardsError) throw rewardsError

        const totalRewards = rewardsData?.reduce((sum, task) => sum + task.reward, 0) || 0

        setReferralStats((prev) => ({
          ...prev,
          totalReferrals: referralData?.length || 0,
          rewards: totalRewards,
        }))
      } catch (error) {
        console.error("Error fetching referral stats:", error)
      }
    }

    fetchReferralStats()
  }, [user.id])

  const handleShare = async () => {
    try {
      const tg = window.Telegram.WebApp
      if (tg) {
        tg.shareUrl(referralStats.referralLink)
      } else {
        await navigator.clipboard.writeText(referralStats.referralLink)
        // Здесь можно добавить уведомление о копировании
      }
    } catch (error) {
      console.error("Error sharing referral link:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Реферальная программа</h2>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          <Share2 className="w-4 h-4" />
          Поделиться
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Всего рефералов</span>
          </div>
          <span className="text-2xl font-bold text-white">{referralStats.totalReferrals}</span>
        </motion.div>

        <motion.div
          className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💎</span>
            <span className="text-sm text-gray-400">Получено наград</span>
          </div>
          <span className="text-2xl font-bold text-white">{referralStats.rewards}</span>
        </motion.div>
      </div>

      {/* Реферальная ссылка */}
      <div className="p-4 space-y-2 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Ваша реферальная ссылка</span>
          <button onClick={handleShare} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Копировать
          </button>
        </div>
        <div className="p-2 text-sm bg-gray-900/50 rounded border border-gray-700 text-gray-300 break-all">
          {referralStats.referralLink}
        </div>
      </div>

      {/* Информация о программе */}
      <div className="text-sm text-gray-400">
        <p>Приглашайте друзей и получайте награды за каждого активного реферала!</p>
        <p className="mt-1">Выполняйте реферальные задания для получения дополнительных бонусов.</p>
      </div>
    </div>
  )
}

