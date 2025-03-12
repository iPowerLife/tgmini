"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Gift, Clock, ChevronRight } from "lucide-react"

export function RewardsSection({ user, onRewardCollected }) {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)

  // Загрузка данных о наградах
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true)

        if (!user?.id) {
          setLoading(false)
          return
        }

        console.log("Загрузка наград для пользователя:", user.id)

        // Получаем доступные награды
        const { data: availableRewards, error: rewardsError } = await supabase
          .from("mining_rewards")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_collected", false)
          .order("created_at", { ascending: false })

        if (rewardsError) {
          console.error("Ошибка при запросе наград:", rewardsError)
          throw rewardsError
        }

        console.log("Доступные награды:", availableRewards)
        setRewards(availableRewards || [])
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке наград:", err)
        setLoading(false)
      }
    }

    fetchRewards()
  }, [user])

  // Функция для сбора награды
  const collectReward = async (rewardId) => {
    try {
      setCollecting(true)

      // Получаем информацию о награде
      const reward = rewards.find((r) => r.id === rewardId)
      if (!reward) {
        throw new Error("Награда не найдена")
      }

      console.log("Сбор награды:", reward)

      // Обновляем статус награды
      const { error: updateError } = await supabase
        .from("mining_rewards")
        .update({
          is_collected: true,
          collected_at: new Date().toISOString(),
        })
        .eq("id", rewardId)

      if (updateError) {
        console.error("Ошибка при обновлении статуса награды:", updateError)
        throw updateError
      }

      // Обновляем баланс пользователя
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error("Ошибка при получении баланса пользователя:", userError)
        throw userError
      }

      const newBalance = (userData.balance || 0) + reward.amount
      const { error: balanceError } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      if (balanceError) {
        console.error("Ошибка при обновлении баланса пользователя:", balanceError)
        throw balanceError
      }

      // Записываем транзакцию
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "reward",
        amount: reward.amount,
        description: `Получена награда: ${reward.description || "Майнинг"}`,
        metadata: {
          reward_id: reward.id,
          reward_type: reward.type || "mining",
        },
      })

      if (transactionError) {
        console.error("Ошибка при записи транзакции:", transactionError)
        // Не прерываем выполнение, так как награда уже собрана
      }

      // Обновляем локальное состояние
      setRewards(rewards.filter((r) => r.id !== rewardId))

      // Вызываем колбэк для обновления баланса в родительском компоненте
      if (onRewardCollected) {
        onRewardCollected(newBalance, reward.amount)
      }

      setCollecting(false)
    } catch (error) {
      console.error("Ошибка при сборе награды:", error)
      alert("Не удалось собрать награду. Пожалуйста, попробуйте позже.")
      setCollecting(false)
    }
  }

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Если нет наград, не отображаем секцию
  if (rewards.length === 0 && !loading) {
    return null
  }

  return (
    <div className="bg-[#242838]/80 backdrop-blur-sm p-3 rounded-lg mx-2 mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-blue-400">Доступные награды</h3>
        {rewards.length > 0 && (
          <span className="text-xs text-gray-400">
            {rewards.length} {rewards.length === 1 ? "награда" : "наград"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-2">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="p-2 rounded-lg border border-blue-500/20 bg-[#1a1d2d] hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
                    <Gift className="text-blue-400" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{reward.description || "Награда за майнинг"}</h4>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock size={10} className="mr-1" />
                      <span>{formatDate(reward.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 font-medium text-sm mr-2">{reward.amount} 💎</span>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-lg text-xs transition-colors flex items-center"
                    onClick={() => collectReward(reward.id)}
                    disabled={collecting}
                  >
                    {collecting ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Собрать</span>
                        <ChevronRight size={12} className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

