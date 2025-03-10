"use client"

import { useState, useEffect } from "react"
import { Trophy, Users } from "lucide-react"
import { supabase } from "../supabase"

export function RatingList({ currentUserId, activeTab = "balance", onTabChange }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка данных пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        console.log("Fetching users data...")

        const { data, error: supabaseError } = await supabase
          .from("users")
          .select(`
            id,
            telegram_id,
            first_name,
            photo_url,
            balance,
            level,
            referral_count
          `)
          .order(activeTab === "balance" ? "balance" : "referral_count", { ascending: false })
          .limit(100)

        if (supabaseError) throw supabaseError

        if (!data) throw new Error("Нет данных")

        const processedData = data.map((user) => ({
          id: user.telegram_id || user.id,
          name: user.first_name || "Пользователь",
          photo_url: user.photo_url,
          balance: Number(user.balance || 0),
          referral_count: Number(user.referral_count || 0),
          level: Number(user.level || 1),
        }))

        setUsers(processedData)
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError("Не удалось загрузить данные рейтинга")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [activeTab])

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex justify-center items-center h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-center text-gray-400 py-8">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Заголовок */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Рейтинг игроков</h1>
        <p className="text-gray-400 text-sm">Соревнуйтесь с другими игроками и поднимайтесь в рейтинге</p>
      </div>

      {/* Вкладки */}
      <div className="flex mb-6 bg-[#242838] rounded-lg p-1">
        <button
          onClick={() => onTabChange("balance")}
          className={`flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
            ${activeTab === "balance" ? "bg-[#3B82F6] text-white" : "text-gray-400 hover:text-gray-300"}`}
        >
          <Trophy size={16} />
          <span>По балансу</span>
        </button>
        <button
          onClick={() => onTabChange("referrals")}
          className={`flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
            ${activeTab === "referrals" ? "bg-[#3B82F6] text-white" : "text-gray-400 hover:text-gray-300"}`}
        >
          <Users size={16} />
          <span>По рефералам</span>
        </button>
      </div>

      {/* Список пользователей */}
      <div className="space-y-2">
        {users.map((user, index) => {
          const isCurrentUser = currentUserId && String(user.id) === String(currentUserId)

          return (
            <div
              key={user.id}
              className={`flex items-center p-3 rounded-lg ${
                isCurrentUser ? "bg-blue-500/10 border-l-2 border-blue-500" : "bg-[#242838]"
              }`}
            >
              {/* Позиция */}
              <div className="w-6 text-center mr-3">
                {index === 0 ? (
                  <span className="text-yellow-400">👑</span>
                ) : index === 1 ? (
                  <span className="text-gray-400">🥈</span>
                ) : index === 2 ? (
                  <span className="text-amber-600">🥉</span>
                ) : (
                  <span className="text-gray-400">{index + 1}</span>
                )}
              </div>

              {/* Аватар */}
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                {user.photo_url ? (
                  <img
                    src={user.photo_url || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">{user.name[0]}</div>
                )}
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium truncate">{user.name}</div>
                    <div className="text-gray-400 text-sm">Уровень {user.level}</div>
                  </div>
                  <div className="flex items-center text-blue-400">
                    <span className="font-medium">
                      {activeTab === "balance" ? user.balance.toFixed(2) : user.referral_count}
                    </span>
                    <span className="ml-1">{activeTab === "balance" ? "💎" : "👥"}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

