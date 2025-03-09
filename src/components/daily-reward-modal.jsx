"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { formatNumber } from "../utils/format-number"
import { X } from "lucide-react"

export function DailyRewardModal({ user, onRewardClaim, onClose, isOpen }) {
  const [rewards, setRewards] = useState([])
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimedAmount, setClaimedAmount] = useState(0)

  // Загрузка наград и прогресса пользователя
  useEffect(() => {
    if (!user?.id || !isOpen) return

    const loadData = async () => {
      try {
        // Загружаем награды
        const { data: rewardsData } = await supabase.from("daily_rewards").select("*").order("day_number")
        if (rewardsData) setRewards(rewardsData)

        // Загружаем прогресс пользователя
        const { data: progressData } = await supabase
          .from("user_daily_rewards")
          .select("*")
          .eq("user_id", user.id)
          .single()
        if (progressData) setUserProgress(progressData)
      } catch (error) {
        console.error("Error loading daily rewards:", error)
      }
    }

    loadData()
  }, [user.id, isOpen])

  // Обновление таймера
  useEffect(() => {
    if (!userProgress?.next_claim_at || !isOpen) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const next = new Date(userProgress.next_claim_at).getTime()
      const diff = next - now

      if (diff <= 0) {
        setTimeLeft("Доступно!")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }

    const timer = setInterval(updateTimer, 1000)
    updateTimer()

    return () => clearInterval(timer)
  }, [userProgress?.next_claim_at, isOpen])

  const handleClaim = async () => {
    if (loading) return

    try {
      setLoading(true)
      console.log("Claiming reward for user:", user.id)

      const { data, error } = await supabase.rpc("claim_daily_reward", {
        user_id_param: user.id,
      })

      if (error) {
        console.error("Error claiming reward:", error)
        alert("Ошибка при получении награды: " + error.message)
        return
      }

      if (data.success) {
        setUserProgress((prev) => ({
          ...prev,
          current_streak: data.new_streak,
          next_claim_at: data.next_claim_at,
          total_claims: (prev?.total_claims || 0) + 1,
        }))

        setClaimSuccess(true)
        setClaimedAmount(data.reward_amount)
        onRewardClaim(data.reward_amount)
      } else {
        alert(data.error || "Ошибка при получении награды")
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
      alert("Ошибка при получении награды")
    } finally {
      setLoading(false)
    }
  }

  // Форматирование суммы награды
  const formatReward = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    return formatNumber(amount)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#1A1F2E] rounded-xl p-4 m-4">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Daily Prize</h2>
          <p className="text-gray-400">Log in every day and collect your rewards.</p>
          {timeLeft && <p className="text-sm text-blue-400 mt-2">Next reward: {timeLeft}</p>}
        </div>

        {claimSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Награда получена!</h3>
            <p className="text-gray-400 mb-4">Вы получили {formatNumber(claimedAmount)} монет</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {rewards.map((reward) => {
              const isCurrentDay = userProgress?.current_streak === reward.day_number
              const isPast = userProgress?.current_streak ? reward.day_number < userProgress.current_streak : false
              const isFuture = userProgress?.current_streak ? reward.day_number > userProgress.current_streak : false

              return (
                <div
                  key={reward.day_number}
                  className={`
                    relative p-3 rounded-xl text-center
                    ${
                      isCurrentDay
                        ? "bg-blue-500/20 border-2 border-blue-500"
                        : isPast
                          ? "bg-gray-800/50 opacity-50"
                          : "bg-gray-800/30"
                    }
                  `}
                >
                  <div className="text-sm text-gray-400 mb-1">Day {reward.day_number}</div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    {reward.icon_url ? (
                      <img src={reward.icon_url || "/placeholder.svg"} alt="" className="w-8 h-8" />
                    ) : (
                      <span className="text-2xl">💎</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-yellow-500">{formatReward(reward.reward_amount)}</div>

                  {isCurrentDay && !timeLeft.includes(":") && (
                    <button
                      onClick={handleClaim}
                      disabled={loading}
                      className="mt-2 w-full py-1 px-3 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {loading ? "..." : "Собрать"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

