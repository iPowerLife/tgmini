"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { createMockRating } from "../utils/mock-data"

const RatingPage = ({ user }) => {
  const [ratingData, setRatingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("mining")

  // Загружаем данные рейтинга из базы данных
  useEffect(() => {
    const fetchRating = async () => {
      try {
        // Получаем данные рейтинга
        const { data, error } = await supabase
          .from("users")
          .select("id, display_name, balance, mining_power, level")
          .order("mining_power", { ascending: false })
          .limit(50)

        if (error) throw error

        if (data && data.length > 0) {
          setRatingData(data)
        } else {
          // Если данных нет, используем моковые данные
          setRatingData(createMockRating())
        }
      } catch (err) {
        console.error("Ошибка при загрузке рейтинга:", err)
        setError(err.message)
        // Используем моковые данные при ошибке
        setRatingData(createMockRating())
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [])

  // Фильтруем данные рейтинга в зависимости от активной вкладки
  const filteredRating = ratingData.sort((a, b) => {
    if (activeTab === "mining") return b.mining_power - a.mining_power
    if (activeTab === "balance") return b.balance - a.balance
    if (activeTab === "level") return b.level - a.level
    return 0
  })

  // Находим позицию текущего пользователя в рейтинге
  const getUserPosition = () => {
    if (!user || !user.id) return null

    const position = filteredRating.findIndex((item) => item.id === user.id)
    if (position === -1) return null

    return {
      position: position + 1,
      total: filteredRating.length,
    }
  }

  const userPosition = getUserPosition()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && ratingData.length === 0) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-white">Ошибка загрузки данных: {error}</p>
        <button
          className="mt-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Рейтинг игроков</h2>

      {/* Вкладки рейтинга */}
      <div className="flex overflow-x-auto py-2 mb-4 no-scrollbar">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("mining")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === "mining" ? "bg-blue-600 text-white" : "bg-[#242838] text-gray-300 hover:bg-[#2A3142]"
            }`}
          >
            <span className="mr-2">⚡</span>
            По мощности
          </button>
          <button
            onClick={() => setActiveTab("balance")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === "balance" ? "bg-blue-600 text-white" : "bg-[#242838] text-gray-300 hover:bg-[#2A3142]"
            }`}
          >
            <span className="mr-2">💎</span>
            По балансу
          </button>
          <button
            onClick={() => setActiveTab("level")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === "level" ? "bg-blue-600 text-white" : "bg-[#242838] text-gray-300 hover:bg-[#2A3142]"
            }`}
          >
            <span className="mr-2">🏆</span>
            По уровню
          </button>
        </div>
      </div>

      {/* Позиция пользователя */}
      {userPosition && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-center">
            Ваша позиция: <span className="font-bold">{userPosition.position}</span> из {userPosition.total}
          </p>
        </div>
      )}

      {/* Таблица рейтинга */}
      <div className="bg-[#1A1F2E] rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 border-b border-gray-700 bg-[#242838]">
          <div className="col-span-1 font-semibold text-gray-400">#</div>
          <div className="col-span-5 font-semibold text-gray-400">Игрок</div>
          <div className="col-span-3 font-semibold text-gray-400 text-right">
            {activeTab === "mining" && "Мощность"}
            {activeTab === "balance" && "Баланс"}
            {activeTab === "level" && "Уровень"}
          </div>
          <div className="col-span-3 font-semibold text-gray-400 text-right">Статус</div>
        </div>

        {filteredRating.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-12 gap-2 p-3 border-b border-gray-700 ${
              user && item.id === user.id ? "bg-blue-500/10" : index % 2 === 0 ? "bg-[#1E2334]" : ""
            }`}
          >
            <div className="col-span-1 font-semibold">{index + 1}</div>
            <div className="col-span-5 truncate">{item.display_name || `Игрок ${index + 1}`}</div>
            <div className="col-span-3 text-right">
              {activeTab === "mining" && <span>{item.mining_power} h/s</span>}
              {activeTab === "balance" && <span>{item.balance} 💎</span>}
              {activeTab === "level" && <span>Уровень {item.level}</span>}
            </div>
            <div className="col-span-3 text-right">
              {index < 3 ? (
                <span className="text-yellow-400">
                  {index === 0 && "🥇 Лидер"}
                  {index === 1 && "🥈 Топ 2"}
                  {index === 2 && "🥉 Топ 3"}
                </span>
              ) : (
                <span className="text-gray-400">Игрок</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingPage

