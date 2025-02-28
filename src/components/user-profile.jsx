"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { User } from "lucide-react"

export function UserProfile({ user }) {
  const [stats, setStats] = useState(null)
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        // Загружаем статистику майнинга
        const { data: statsData, error: statsError } = await supabase
          .from("mining_stats")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (statsError && statsError.code !== "PGRST116") {
          console.error("Error loading stats:", statsError)
          throw statsError
        }

        // Загружаем майнеры пользователя
        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select(`
          *,
          model:miner_models (
            display_name,
            mining_power
          )
        `)
          .eq("user_id", user.id)

        if (minersError) {
          console.error("Error loading miners:", minersError)
          throw minersError
        }

        setStats(statsData || { total_mined: 0, mining_count: 0 })
        setMiners(minersData || [])
      } catch (err) {
        console.error("Error loading user data:", err)
        setError("Ошибка загрузки данных пользователя")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id])

  if (!user) {
    return <div className="section-container">Загрузка профиля...</div>
  }

  if (loading) {
    return <div className="section-container">Загрузка данных...</div>
  }

  if (error) {
    return <div className="section-container error">{error}</div>
  }

  // Вычисляем общую мощность майнинга
  const totalMiningPower = miners.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          {user.photo_url ? (
            <img
              src={user.photo_url || "/placeholder.svg"}
              alt={user.username || user.first_name}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              <User className="avatar-icon" />
            </div>
          )}
        </div>
        <div className="user-info">
          <h2>{user.username ? `@${user.username}` : user.first_name}</h2>
          <p className="user-id">ID: {user.telegram_id}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalMiningPower.toFixed(3)}</div>
          <div className="stat-label">Мощность ⚡</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.total_mined?.toFixed(2) || "0.00"}</div>
          <div className="stat-label">Всего добыто 💎</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.mining_count || "0"}</div>
          <div className="stat-label">Кол-во майнингов</div>
        </div>
      </div>

      {miners.length > 0 && (
        <div className="miners-summary">
          <h3>Ваши майнеры</h3>
          <div className="miners-list">
            {miners.map((miner) => (
              <div key={miner.id} className="miner-item">
                <span>{miner.model.display_name}</span>
                <span>x{miner.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

