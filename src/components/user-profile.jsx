"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

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

        if (statsError) {
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

        setStats(statsData)
        setMiners(minersData)
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
    return <div className="section-container">Пользователь не найден</div>
  }

  if (loading) {
    return <div className="section-container">Загрузка профиля...</div>
  }

  if (error) {
    return <div className="section-container error">{error}</div>
  }

  // Вычисляем общую мощность майнинга
  const totalMiningPower = miners.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">{user.first_name?.[0] || user.telegram_id.toString()[0]}</div>
        <div className="user-info">
          <h2>{user.first_name || "Пользователь"}</h2>
          {user.username && <p className="username">@{user.username}</p>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{user.telegram_id}</div>
          <div className="stat-label">Telegram ID</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.level}</div>
          <div className="stat-label">Уровень</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.total_mined?.toFixed(2) || "0.00"}</div>
          <div className="stat-label">Всего добыто</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.mining_count || "0"}</div>
          <div className="stat-label">Кол-во майнингов</div>
        </div>
      </div>

      <div className="mining-power">
        <h3>Мощность майнинга</h3>
        <div className="stat-value">{totalMiningPower.toFixed(3)} ⚡</div>
      </div>

      <div className="experience-bar">
        <div
          className="experience-progress"
          style={{
            width: `${(user.experience / user.next_level_exp) * 100}%`,
          }}
        />
        <span className="experience-text">
          {user.experience} / {user.next_level_exp} XP
        </span>
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

