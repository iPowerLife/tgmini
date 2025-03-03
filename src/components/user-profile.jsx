"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Skeleton } from "./skeleton"

function ProfileSkeleton() {
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-gray-800/50 rounded-xl p-6 mb-4 border border-gray-700/50">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

export function UserProfile({ user }) {
  const [stats, setStats] = useState(null)
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: statsData } = await supabase.from("mining_stats").select("*").eq("user_id", user.id).single()

        const { data: minersData } = await supabase
          .from("user_miners")
          .select(`
            *,
            model:miner_models (
              display_name,
              mining_power
            )
          `)
          .eq("user_id", user.id)

        setStats(statsData || { total_mined: 0, mining_count: 0 })
        setMiners(minersData || [])
      } catch (err) {
        console.error("Error loading user data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadUserData()
    }
  }, [user?.id])

  if (!user) return null

  if (loading) {
    return <ProfileSkeleton />
  }

  const totalMiningPower = miners.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

  return (
    <div className="min-h-[100vh] pb-[80px]">
      <div className="px-4">
        <div className="max-w-md mx-auto p-4 flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-[#161b22] border border-[#30363d]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url || "/placeholder.svg"}
                      alt="Profile"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#30363d]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#21262d] flex items-center justify-center border-2 border-[#30363d]">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{user.display_name}</h2>
                  <div className="px-3 py-1.5 rounded-lg bg-[#21262d] w-fit">
                    <span className="font-mono text-sm font-medium text-[#8b949e]">#{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
              <div className="text-[#8b949e] text-sm mb-2">Баланс</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">{user.balance.toFixed(2)} 💎</div>
            </div>
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
              <div className="text-[#8b949e] text-sm mb-2">Мощность</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {totalMiningPower.toFixed(3)} ⚡
              </div>
            </div>
          </div>

          {miners.length > 0 && (
            <div className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden">
              <div className="p-4 border-b border-[#30363d]">
                <h3 className="font-medium text-white">Ваши майнеры</h3>
              </div>
              <div className="divide-y divide-[#30363d]">
                {miners.map((miner) => (
                  <div
                    key={miner.id}
                    className="p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors"
                  >
                    <span className="text-white">{miner.model.display_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8b949e]">{miner.model.mining_power} ⚡</span>
                      <span className="px-2 py-1 rounded-md bg-[#21262d] text-[#8b949e] text-sm">
                        x{miner.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

