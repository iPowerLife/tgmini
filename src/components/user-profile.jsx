"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function UserProfile({ user }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await supabase.from("mining_stats").select("*").eq("user_id", user.id).single()

        if (error) throw error
        setStats(data)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  if (!user) return null

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">{user.first_name?.[0] || "U"}</div>
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
          <div className="stat-value">{loading ? "..." : stats?.total_mined?.toFixed(2) || "0.00"}</div>
          <div className="stat-label">Всего добыто</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? "..." : stats?.mining_count || "0"}</div>
          <div className="stat-label">Кол-во майнингов</div>
        </div>
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
    </div>
  )
}

