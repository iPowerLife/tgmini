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
  const [error, setError] = useState(null)

  // Загрузка наград и прогресса пользователя
  useEffect(() => {
    if (!user?.id || !isOpen) return

    const loadData = async () => {
      try {
        console.log("Loading daily rewards data for user:", user.id)

        // Загружаем награды
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("daily_rewards")
          .select("*")
          .order("day_number")

        if (rewardsError) {
          console.error("Error loading rewards:", rewardsError)
          throw rewardsError
        }

        if (rewardsData && rewardsData.length > 0) {
          console.log("Loaded rewards:", rewardsData.length)
          setRewards(rewardsData)
        } else {
          console.warn("No rewards found in database")
          // Создаем тестовые награды, если их нет в базе
          const mockRewards = Array.from({ length: 30 }, (_, i) => ({
            day_number: i + 1,
            reward_amount: (i + 1) * 1000,
            icon_url: null,
          }))
          setRewards(mockRewards)
        }

        // Загружаем прогресс пользователя
        const { data: progressData, error: progressError } = await supabase
          .from("user_daily_rewards")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (progressError && progressError.code !== "PGRST116") {
          // PGRST116 - это код ошибки "не найдено", который мы ожидаем для новых пользователей
          console.error("Error loading user progress:", progressError)
        }

        if (progressData) {
          console.log("Loaded user progress:", progressData)
          setUserProgress(progressData)
        } else {
          console.log("No user progress found, user will start from day 1")
        }

        // Сбрасываем состояние успеха при каждом открытии
        setClaimSuccess(false)
        setError(null)
      } catch (error) {
        console.error("Error in loadData:", error)
        setError("Не удалось загрузить данные о наградах")
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

    console.log("Starting reward claim process for user:", user.id)
    console.log("Current user progress:", userProgress)

    try {
      setLoading(true)
      setError(null)
      console.log("Claiming reward for user:", user.id)

      // Вызываем RPC функцию для получения награды
      const { data, error } = await supabase.rpc("claim_daily_reward", {
        user_id_param: user.id,
      })

      console.log("Claim response:", data, error)

      if (error) {
        console.error("Error claiming reward:", error)
        // Показываем полное сообщение об ошибке для отладки
        setError(`Ошибка при получении награды: ${error.message || "Неизвестная ошибка"}`)
        if (error.details) console.error("Error details:", error.details)
        if (error.hint) console.error("Error hint:", error.hint)
        return
      }

      // Остальной код остается без изменений
      if (data && data.success) {
        console.log("Reward claimed successfully:", data)

        // Обновляем прогресс пользователя
        setUserProgress((prev) => ({
          ...prev,
          current_streak: data.new_streak,
          next_claim_at: data.next_claim_at,
          total_claims: (prev?.total_claims || 0) + 1,
        }))

        // Показываем сообщение об успехе
        setClaimSuccess(true)
        setClaimedAmount(data.reward_amount)

        // Обновляем баланс пользователя через колбэк
        if (onRewardClaim && data.new_balance) {
          onRewardClaim(data.new_balance)
        } else if (onRewardClaim) {
          // Если новый баланс не вернулся, просто добавляем сумму награды
          onRewardClaim(user.balance + data.reward_amount)
        }
      } else {
        console.error("Claim failed:", data)
        setError(data?.error || "Ошибка при получении награды")
      }
    } catch (error) {
      console.error("Exception claiming reward:", error)
      setError(`Произошла ошибка при получении награды: ${error.message || "Неизвестная ошибка"}`)
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
        // Предотвращаем закрытие модального окна при клике на фон
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#1A1F2E] rounded-xl p-4 m-4"
        onClick={(e) => {
          // Останавливаем распространение событий внутри модального окна
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {userProgress && (
          <div className="mb-4 text-left bg-black/30 p-2 rounded-lg text-xs text-gray-400">
            <p>ID: {user.id}</p>
            <p>Текущий день: {userProgress.current_streak || "Не установлен"}</p>
            <p>Последнее получение: {userProgress.last_claim_at || "Никогда"}</p>
            <p>Следующее доступно: {userProgress.next_claim_at || "Сейчас"}</p>
            <p>Всего получено: {userProgress.total_claims || 0}</p>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Ежедневная награда</h2>
          <p className="text-gray-400">Заходите каждый день и получайте награды</p>
          {timeLeft && <p className="text-sm text-blue-400 mt-2">Следующая награда: {timeLeft}</p>}

          {error && <div className="mt-2 p-2 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
        </div>

        {claimSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Награда получена!</h3>
            <p className="text-gray-400 mb-4">Вы получили {formatNumber(claimedAmount)} монет</p>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {rewards.map((reward) => {
              const isCurrentDay =
                userProgress?.current_streak === reward.day_number || (!userProgress && reward.day_number === 1)
              const isPast = userProgress?.last_claim_at && reward.day_number < userProgress.current_streak
              const isFuture = userProgress?.current_streak
                ? reward.day_number > userProgress.current_streak
                : reward.day_number > 1

              return (
                <div
                  key={reward.day_number}
                  className={`
                    relative p-3 rounded-xl text-center transition-all
                    ${
                      isCurrentDay
                        ? "bg-blue-500/20 border-2 border-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                        : isPast
                          ? "bg-green-900/20 border border-green-500/30"
                          : "bg-gray-800/30 border border-gray-700/30"
                    }
                    ${isPast ? "hover:bg-green-900/30" : isFuture ? "hover:bg-gray-800/50" : ""}
                  `}
                >
                  {/* Индикатор статуса */}
                  {isPast && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`text-sm mb-1 ${
                      isPast ? "text-green-400" : isCurrentDay ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    День {reward.day_number}
                  </div>

                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center
                    ${
                      isPast
                        ? "bg-green-900/30 border border-green-500/30"
                        : isCurrentDay
                          ? "bg-blue-900/30 border border-blue-500/30"
                          : "bg-gray-700/30 border border-gray-600/30"
                    }
                  `}
                  >
                    {reward.icon_url ? (
                      <img src={reward.icon_url || "/placeholder.svg"} alt="" className="w-8 h-8" />
                    ) : (
                      <span className="text-2xl">💎</span>
                    )}
                  </div>

                  <div
                    className={`text-sm font-medium ${
                      isPast ? "text-green-400" : isCurrentDay ? "text-yellow-500" : "text-gray-400"
                    }`}
                  >
                    {formatReward(reward.reward_amount)}
                  </div>

                  {isCurrentDay && timeLeft === "Доступно!" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleClaim()
                      }}
                      disabled={loading}
                      className="mt-2 w-full py-1 px-3 text-xs font-medium text-white 
                        bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors 
                        disabled:bg-gray-600 disabled:text-gray-400"
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

