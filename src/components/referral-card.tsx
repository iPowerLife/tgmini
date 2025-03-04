"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { Share2, Users, Trophy } from "lucide-react"

interface ReferralStats {
  total_referrals: number
  total_earnings: number
  referral_code: string
  recent_referrals: Array<{
    id: string
    username: string
    joined_at: string
  }>
}

export const ReferralCard = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadReferralStats = async () => {
      const { data, error } = await supabase.rpc("get_referral_stats", {
        user_id_param: userId,
      })

      if (error) {
        console.error("Error loading referral stats:", error)
        return
      }

      setStats(data)
    }

    loadReferralStats()
  }, [userId])

  const handleCopyCode = async () => {
    if (!stats?.referral_code) return

    try {
      await navigator.clipboard.writeText(stats.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  if (!stats) return null

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid rgba(59, 130, 246, 0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Заголовок */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)", margin: 0 }}>
          Реферальная программа
        </h2>
        <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
          Приглашайте друзей и получайте награды
        </p>
      </div>

      {/* Статистика */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <Users size={20} style={{ marginBottom: "8px", color: "#60a5fa" }} />
          <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#60a5fa" }}>{stats.total_referrals}</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>Рефералов</div>
        </div>
        <div
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <Trophy size={20} style={{ marginBottom: "8px", color: "#60a5fa" }} />
          <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#60a5fa" }}>{stats.total_earnings} 💎</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>Заработано</div>
        </div>
      </div>

      {/* Реферальный код */}
      <div
        style={{
          background: "rgba(59, 130, 246, 0.05)",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
          Ваш реферальный код:
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
        >
          <code style={{ fontSize: "1rem", color: "#60a5fa", fontFamily: "monospace" }}>{stats.referral_code}</code>
          <motion.button
            onClick={handleCopyCode}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "transparent",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: copied ? "#34d399" : "#60a5fa",
            }}
          >
            <Share2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Последние рефералы */}
      {stats.recent_referrals?.length > 0 && (
        <div>
          <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>
            Последние рефералы:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stats.recent_referrals.map((referral) => (
              <div
                key={referral.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(59, 130, 246, 0.05)",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)" }}>{referral.username}</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
                  {new Date(referral.joined_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

