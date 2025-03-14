"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

const ProfilePage = ({ user, onLogout }) => {
  const [userMiners, setUserMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalMiners: 0,
    totalMiningPower: 0,
    totalMined: 0,
  })

  // Загружаем данные майнеров пользователя
  useEffect(() => {
    const fetchUserMiners = async () => {
      if (!user || !user.id) {
        setLoading(false)
        return
      }

      try {
        // Получаем майнеры пользователя с информацией о моделях
        const { data, error } = await supabase.rpc("get_user_miners_with_models", {
          user_id_param: user.id,
        })

        if (error) throw error

        if (data && data.length > 0) {
          setUserMiners(data)

          // Рассчитываем статистику
          const totalMiners = data.reduce((sum, item) => sum + item.quantity, 0)
          const totalMiningPower = data.reduce((sum, item) => sum + item.model.mining_power * item.quantity, 0)
          const totalMined = data.reduce((sum, item) => sum + (item.total_mined || 0), 0)

          setStats({
            totalMiners,
            totalMiningPower,
            totalMined,
          })
        }
      } catch (err) {
        console.error("Ошибка при загрузке майнеров пользователя:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserMiners()
  }, [user])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      if (onLogout) onLogout()

      // Перезагружаем страницу для сброса состояния
      window.location.reload()
    } catch (error) {
      console.error("Ошибка при выходе:", error)
      alert(`Ошибка: ${error.message || "Не удалось выйти из аккаунта"}`)
    }
  }

  return (
    <div>
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">{user?.display_name || "Пользователь"}</h2>
        <p className="text-gray-400 mb-4">ID: {user?.id?.substring(0, 8) || "Не авторизован"}</p>
      </div>

      {/* Информация о балансе и статусе */}
      <div className="bg-[#242838]/80 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Баланс:</span>
          <span className="font-bold text-blue-400">{user?.balance || 0} 💎</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Miner Pass:</span>
          <span className={user?.hasMinerPass ? "text-yellow-400" : "text-gray-400"}>
            {user?.hasMinerPass ? "Активен ✨" : "Не активен"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Уровень:</span>
          <span className="text-white">{user?.level || 1}</span>
        </div>
      </div>

      {/* Статистика майнинга */}
      <div className="bg-[#242838]/80 p-3 rounded-lg mb-4">
        <h3 className="font-semibold mb-3">Статистика майнинга</h3>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#1A1F2E] p-2 rounded text-center">
            <div className="text-xs text-gray-400">Майнеров</div>
            <div className="font-semibold">{stats.totalMiners}</div>
          </div>
          <div className="bg-[#1A1F2E] p-2 rounded text-center">
            <div className="text-xs text-gray-400">Мощность</div>
            <div className="font-semibold">{stats.totalMiningPower} h/s</div>
          </div>
          <div className="bg-[#1A1F2E] p-2 rounded text-center">
            <div className="text-xs text-gray-400">Добыто</div>
            <div className="font-semibold">{stats.totalMined.toFixed(2)} 💎</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-2">Ошибка загрузки данных</div>
        ) : userMiners.length === 0 ? (
          <div className="text-center text-gray-400 py-2">У вас пока нет майнеров</div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-400 mb-1">Ваши майнеры:</h4>
            {userMiners.map((item) => (
              <div key={item.id} className="bg-[#1A1F2E] p-2 rounded flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center mr-2">
                    <img
                      src={item.model.image_url || "https://cdn-icons-png.flaticon.com/512/2991/2991109.png"}
                      alt={item.model.display_name || item.model.name}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <div className="text-sm">{item.model.display_name || item.model.name}</div>
                    <div className="text-xs text-gray-400">{item.model.mining_power} h/s</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">x{item.quantity}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded w-full" onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}

export default ProfilePage

