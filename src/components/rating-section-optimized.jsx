"use client"

import { memo, useEffect } from "react"
import { Trophy, Medal } from "lucide-react"
import { useCachedData } from "../hooks/use-cached-data"
import { supabase } from "../supabase"

// Функция для загрузки данных рейтинга
const fetchRatingData = async () => {
  const { data, error } = await supabase.rpc("get_users_rating")
  if (error) throw error
  return data || []
}

export const RatingSection = memo(function RatingSection({ currentUserId }) {
  // Используем хук для кэширования данных рейтинга
  const {
    data: users,
    loading,
    error,
    refresh,
  } = useCachedData(
    fetchRatingData,
    [], // Пустой массив зависимостей, так как функция не зависит от пропсов
    2 * 60 * 1000, // Кэшируем на 2 минуты
  )

  // Обновляем данные каждые 5 минут
  useEffect(() => {
    const interval = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refresh])

  if (loading) {
    return (
      <div className="section-container">
        <h2 className="text-xl font-bold mb-4">Рейтинг игроков</h2>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-container">
        <h2 className="text-xl font-bold mb-4">Рейтинг игроков</h2>
        <p className="text-center text-red-400 my-8">Ошибка загрузки данных. Попробуйте позже.</p>
        <button onClick={refresh} className="mx-auto block px-4 py-2 bg-blue-600 text-white rounded-lg">
          Попробовать снова
        </button>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="section-container">
        <h2 className="text-xl font-bold mb-4">Рейтинг игроков</h2>
        <p className="text-center text-gray-400 my-8">Данные рейтинга недоступны.</p>
      </div>
    )
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="rank-icon gold" />
    if (index === 1) return <Medal className="rank-icon silver" />
    if (index === 2) return <Medal className="rank-icon bronze" />
    return <span className="rank-number">{index + 1}</span>
  }

  return (
    <div className="section-container">
      <div className="leaderboard-header">
        <h2>Рейтинг игроков</h2>
      </div>

      <div className="leaderboard-list">
        {users.map((user, index) => (
          <div key={user.id} className={`leaderboard-item ${user.id === currentUserId ? "current-user" : ""}`}>
            <div className="rank">{getRankIcon(index)}</div>
            <div className="user-info">
              <div className="avatar-container">
                {user.photo_url ? (
                  <img src={user.photo_url || "/placeholder.svg"} alt={user.display_name} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">{user.display_name?.charAt(0) || "U"}</div>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user.display_name}</div>
                <div className="user-level">Уровень {user.level}</div>
              </div>
            </div>
            <div className="user-stats">
              <div className="balance">{user.balance.toFixed(2)} 💎</div>
              <div className="mining-power">{user.mining_power.toFixed(2)} ⚡/сек</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

