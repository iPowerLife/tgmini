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

      <style jsx>{`
        .profile-container {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto 30px;
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0.8));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
          border: 3px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .user-info {
          flex: 1;
        }

        .user-info h2 {
          margin: 0;
          font-size: 24px;
          color: #f8fafc;
        }

        .username {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(15, 23, 42, 0.3);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(99, 102, 241, 0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #f8fafc;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .experience-bar {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
          height: 20px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .experience-progress {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0.8));
          height: 100%;
          transition: width 0.3s ease;
          position: relative;
        }

        .experience-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: shine 2s infinite;
        }

        .experience-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 500;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
          white-space: nowrap;
        }

        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

