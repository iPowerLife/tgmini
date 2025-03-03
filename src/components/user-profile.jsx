"use client"

import { useEffect, useState } from "react"
import { Users, Share2 } from "lucide-react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export function UserProfile({ user, miners, totalPower }) {
  const [telegramUser, setTelegramUser] = useState(null)
  const [stats, setStats] = useState({
    total_mined: miners.reduce((sum, miner) => sum + (miner.total_mined || 0), 0),
    mining_count: miners.length,
    mining_power: totalPower,
    referral_rewards: 0, // Будет обновляться из базы данных
    referral_count: 0,
  })
  const supabase = useSupabaseClient()

  useEffect(() => {
    async function getTelegramUser() {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user
        console.log("DEBUG: Telegram user from WebApp:", tgUser)
        console.log("DEBUG: Telegram user ID:", tgUser?.id)
        setTelegramUser(tgUser)
      }
    }

    getTelegramUser()
  }, [])

  useEffect(() => {
    async function fetchReferralStats() {
      if (telegramUser?.id) {
        console.log("DEBUG: Fetching referral stats for telegram_id:", telegramUser.id)
        console.log("DEBUG: telegramUser object:", telegramUser)
        // Получаем id пользователя по его telegram_id
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("telegram_id", telegramUser.id)
          .single()

        if (userError || !userData) {
          console.error("Error fetching user:", userError)
          return
        }

        // Получаем статистику рефералов
        const { data: referralStats, error: referralError } = await supabase
          .from("referral_users")
          .select(`
            referrer_id,
            referral_count:referred_id(count),
            referrals:json_agg(json_build_object(
              'referred_id', referred_id,
              'joined_at', joined_at,
              'status', status
            ))
          `)
          .eq("referrer_id", userData.id)
          .eq("status", "active")
          .group("referrer_id")
          .single()

        if (!referralError && referralStats) {
          setStats((prev) => ({
            ...prev,
            referral_count: referralStats.referral_count || 0,
          }))
        }
      }
    }

    fetchReferralStats()
  }, [telegramUser, supabase])

  if (!user) return null

  const referralLink = `https://t.me/trteeeeeee_bot?start=${telegramUser?.id || ""}`
  console.log("DEBUG: Generated referral link:", referralLink)

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6">
        {/* Профиль */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="relative">
              {telegramUser?.photo_url ? (
                <img
                  src={telegramUser.photo_url || "/placeholder.svg"}
                  alt={telegramUser.first_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-700/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-700/50 flex items-center justify-center border-2 border-gray-700/50">
                  <span className="text-2xl font-bold text-gray-400">{telegramUser?.first_name?.[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{telegramUser?.first_name}</h2>
              <p className="text-sm text-gray-400 font-mono">ID: {telegramUser?.id}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.total_mined.toFixed(2)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Всего намайнено 💎</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.mining_count}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Кол-во майнеров</div>
          </div>

          <div className="col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.mining_power.toFixed(3)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Общая мощность ⚡</div>
          </div>
        </div>

        {/* Список майнеров */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Ваши майнеры</h3>
          <div className="space-y-2">
            {miners.map((miner) => (
              <div
                key={miner.id}
                className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0"
              >
                <span className="text-white">{miner.model.display_name}</span>
                <span className="text-gray-400">x{miner.quantity}</span>
              </div>
            ))}
            {miners.length === 0 && <div className="text-gray-500 text-sm">У вас пока нет майнеров</div>}
          </div>
        </div>

        {/* Реферальная система */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Реферальная система</h3>
            <button
              onClick={async () => {
                const link = `https://t.me/trteeeeeee_bot?start=${telegramUser?.id || ""}`
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.shareUrl(link)
                } else {
                  await navigator.clipboard.writeText(link)
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors rounded-lg bg-blue-600/90 hover:bg-blue-700/90"
            >
              <Share2 className="w-3.5 h-3.5" />
              Пригласить
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Рефералы</span>
              </div>
              <span className="text-xl font-bold text-white">{stats.referral_count || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💎</span>
                <span className="text-xs text-gray-400">Награды</span>
              </div>
              <span className="text-xl font-bold text-white">{stats.referral_rewards || 0}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-400">Реферальная ссылка</div>
            <div className="p-2 text-sm bg-gray-900/50 rounded border border-gray-700/30 text-gray-300 font-mono break-all">
              https://t.me/trteeeeeee_bot?start={telegramUser?.id || ""}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Приглашайте друзей и получайте награды за каждого активного реферала
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

