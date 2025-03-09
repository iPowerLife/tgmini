"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { formatNumber } from "../utils/format-number"
import { DailyRewardModal } from "./daily-reward-modal"

export function DailyRewardTask({ user, onRewardClaim }) {
  const [userProgress, setUserProgress] = useState(null)
  const [currentReward, setCurrentReward] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Загрузка прогресса пользователя и текущей награды
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log("Loading daily reward data for user:", user.id)

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

          // Загружаем текущую награду
          const currentDay = progressData.current_streak || 1
          const { data: rewardData, error: rewardError } = await supabase
            .from("daily_rewards")
            .select("*")
            .eq("day_number", currentDay)
            .single()

          if (rewardError) {
            console.error("Error loading reward for day", currentDay, ":", rewardError)
          }

          if (rewardData) {
            console.log("Loaded current reward:", rewardData)
            setCurrentReward(rewardData)
          } else {
            // Если награда не найдена, создаем тестовую
            console.log("Creating mock reward for day", currentDay)
            setCurrentReward({
              day_number: currentDay,
              reward_amount: currentDay * 1000,
              icon_url: null,
            })
          }
        } else {
          console.log("No user progress found, user will start from day 1")

          // Если прогресса нет, загружаем награду за первый день
          const { data: rewardData, error: rewardError } = await supabase
            .from("daily_rewards")
            .select("*")
            .eq("day_number", 1)
            .single()

          if (rewardError) {
            console.error("Error loading reward for day 1:", rewardError)
          }

          if (rewardData) {
            console.log("Loaded day 1 reward:", rewardData)
            setCurrentReward(rewardData)
          } else {
            // Если награда не найдена, создаем тестовую
            console.log("Creating mock reward for day 1")
            setCurrentReward({
              day_number: 1,
              reward_amount: 1000,
              icon_url: null,
            })
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  // Обновление таймера
  useEffect(() => {
    if (!userProgress?.next_claim_at) {
      setTimeLeft("Доступно!")
      return
    }

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
  }, [userProgress?.next_claim_at])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Перезагружаем данные после закрытия модального окна
    if (user?.id) {
      refreshData()
    }
  }

  const refreshData = async () => {
    try {
      console.log("Refreshing daily reward data")

      // Загружаем обновленный прогресс пользователя
      const { data: progressData } = await supabase
        .from("user_daily_rewards")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (progressData) {
        setUserProgress(progressData)

        // Загружаем текущую награду
        const currentDay = progressData.current_streak || 1
        const { data: rewardData } = await supabase
          .from("daily_rewards")
          .select("*")
          .eq("day_number", currentDay)
          .single()

        if (rewardData) {
          setCurrentReward(rewardData)
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  const handleRewardClaim = (newBalance) => {
    console.log("Reward claimed, new balance:", newBalance)

    // Обновляем баланс через колбэк
    if (onRewardClaim) {
      onRewardClaim(newBalance)
    }

    // Перезагружаем данные
    refreshData()
  }

  // Если данные еще не загружены
  if (loading) {
    return (
      <div className="flex items-center rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg bg-[#242838] p-4">
        <div className="w-full text-center text-gray-400">Загрузка ежедневной награды...</div>
      </div>
    )
  }

  // Если награда не найдена
  if (!currentReward) {
    return (
      <div className="flex items-center rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg bg-[#242838] p-4">
        <div className="w-full text-center text-gray-400">Ежедневная награда недоступна</div>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex items-center rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg bg-gradient-to-br from-[#242838] to-[#1A1F2E] cursor-pointer hover:border-blue-500/30 transition-colors"
        onClick={handleOpenModal}
      >
        {/* Иконка задания */}
        <div className="w-14 h-14 flex-shrink-0 p-2 flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-blue-500/20 border border-blue-500/30">
            <span className="text-2xl">🎁</span>
          </div>
        </div>

        {/* Содержимое задания */}
        <div className="flex-1 py-2 pr-2">
          <div className="text-white text-sm font-medium">Ежедневная награда</div>
          <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">Заходите каждый день и получайте награду</div>
          <div className="flex items-center mt-0.5">
            <span className="text-blue-400 font-bold text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              +{formatNumber(currentReward.reward_amount)}
            </span>
            {userProgress?.current_streak > 1 && (
              <span className="ml-2 text-xs text-yellow-500">День {userProgress.current_streak}</span>
            )}
          </div>
        </div>

        {/* Кнопка */}
        <div className="pr-3">
          {timeLeft === "Доступно!" ? (
            <button
              onClick={(e) => {
                e.preventDefault() // Предотвращаем всплытие события
                e.stopPropagation() // Предотвращаем всплытие события
                handleOpenModal() // Открываем модальное окно
              }}
              className="px-4 py-1.5 rounded-full font-medium transition-all text-white shadow-md text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Собрать
            </button>
          ) : (
            <div className="text-center">
              <div className="text-xs text-gray-400">{timeLeft}</div>
            </div>
          )}
        </div>
      </div>

      <DailyRewardModal user={user} onRewardClaim={handleRewardClaim} onClose={handleCloseModal} isOpen={isModalOpen} />
    </>
  )
}

