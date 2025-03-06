"use client"

import { useState, useEffect } from "react"
import { Shield, Clock, Check, AlertCircle } from "lucide-react"
import { supabase } from "../supabase"

export const MinerPassInfo = ({ userId, hasMinerPass }) => {
  const [passDetails, setPassDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadPassDetails = async () => {
      try {
        setLoading(true)

        // Получаем информацию о Miner Pass пользователя
        const { data, error } = await supabase
          .from("user_special_items")
          .select(`
            *,
            item:special_items (
              name,
              display_name,
              description,
              price,
              duration_days
            )
          `)
          .eq("user_id", userId)
          .eq("item.name", "miner_pass")
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Ошибка при загрузке данных Miner Pass:", error)
          return
        }

        setPassDetails(data || null)
      } catch (err) {
        console.error("Ошибка:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPassDetails()
  }, [userId, hasMinerPass])

  // Если пользователь не имеет Miner Pass, показываем информацию о преимуществах
  if (!hasMinerPass) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Shield className="text-yellow-500" size={20} />
            <span className="font-medium">Miner Pass</span>
          </div>
          <span className="text-sm text-gray-400">Недоступно</span>
        </div>

        <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-yellow-500/90">
              Приобретите Miner Pass в магазине, чтобы получить дополнительные преимущества и снять ограничения на
              покупку майнеров.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Снятие лимитов на покупку майнеров</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Бонус +10% к хешрейту всех майнеров</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Ежедневные бонусы и награды</span>
          </div>
        </div>
      </div>
    )
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-yellow-500" size={20} />
            <span className="font-medium">Miner Pass</span>
          </div>
          <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Если у пользователя есть Miner Pass, показываем информацию о нем
  const expiresAt = passDetails?.expires_at ? new Date(passDetails.expires_at) : null
  const now = new Date()

  // Рассчитываем оставшиеся дни
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))) : "∞"

  // Определяем статус (активен/истекает скоро/бессрочный)
  let status = "active"
  if (!expiresAt) {
    status = "permanent"
  } else if (daysLeft <= 3) {
    status = "expiring"
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Shield className="text-yellow-500" size={20} />
          <span className="font-medium">Miner Pass</span>
        </div>
        <span
          className={`text-sm ${
            status === "active" ? "text-green-500" : status === "expiring" ? "text-orange-500" : "text-yellow-500"
          }`}
        >
          {status === "active" ? "Активен" : status === "expiring" ? "Истекает скоро" : "Бессрочный"}
        </span>
      </div>

      {status !== "permanent" && (
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-yellow-500" />
              <span className="text-sm text-gray-300">Осталось дней:</span>
            </div>
            <span className="text-sm font-medium text-yellow-500">{daysLeft}</span>
          </div>
          <div className="bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${daysLeft <= 3 ? "bg-orange-500" : "bg-yellow-500"}`}
              style={{
                width: `${Math.min(100, (daysLeft / 30) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Лимиты на покупку майнеров сняты</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Бонус +10% к хешрейту активен</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Ежедневные бонусы доступны</span>
        </div>
      </div>
    </div>
  )
}

