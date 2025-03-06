"use client"

import { useState, useEffect } from "react"
import { Settings, Save, AlertCircle } from "lucide-react"
import { supabase } from "../supabase"

export const MiningSettings = ({ userId }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    collection_interval_hours: 8,
    min_collection_period_hours: 4,
    max_collection_period_hours: 24,
    base_reward_rate: 0.5,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Загрузка настроек
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Проверяем, является ли пользователь администратором
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", userId)
          .single()

        if (userError) throw userError
        setIsAdmin(userData?.is_admin || false)

        // Если не админ, не загружаем настройки
        if (!userData?.is_admin) {
          setLoading(false)
          return
        }

        // Получаем настройки майнинга
        const { data, error } = await supabase.rpc("get_mining_settings")

        if (error) throw error
        if (data) {
          setSettings({
            collection_interval_hours: data.collection_interval_hours,
            min_collection_period_hours: data.min_collection_period_hours,
            max_collection_period_hours: data.max_collection_period_hours,
            base_reward_rate: data.base_reward_rate,
          })
        }
      } catch (err) {
        console.error("Error loading mining settings:", err)
        setError("Ошибка при загрузке настроек")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadSettings()
    }
  }, [userId])

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: name === "base_reward_rate" ? Number.parseFloat(value) : Number.parseInt(value, 10),
    }))
  }

  // Сохранение настроек
  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Проверка валидности данных
      if (
        settings.collection_interval_hours < 1 ||
        settings.min_collection_period_hours < 1 ||
        settings.max_collection_period_hours < settings.min_collection_period_hours ||
        settings.base_reward_rate <= 0
      ) {
        throw new Error("Некорректные параметры настроек")
      }

      const { data, error } = await supabase.rpc("update_mining_settings", {
        collection_interval_hours_param: settings.collection_interval_hours,
        min_collection_period_hours_param: settings.min_collection_period_hours,
        max_collection_period_hours_param: settings.max_collection_period_hours,
        base_reward_rate_param: settings.base_reward_rate,
      })

      if (error) throw error

      if (data.success) {
        setSuccess("Настройки успешно сохранены")
      } else {
        throw new Error(data.error || "Ошибка при сохранении настроек")
      }
    } catch (err) {
      console.error("Error saving mining settings:", err)
      setError(err.message || "Ошибка при сохранении настроек")
    } finally {
      setSaving(false)
    }
  }

  // Если пользователь не админ, не показываем компонент
  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-[#0F1729]/90 p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="text-purple-500" size={18} />
          <span className="font-medium">Настройки майнинга</span>
        </div>
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0F1729]/90 p-4 rounded-xl mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="text-purple-500" size={18} />
        <span className="font-medium">Настройки майнинга</span>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-950/30 border border-green-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Save className="text-green-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-green-500/90">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-3">
          {/* Стандартный интервал сбора */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Стандартный интервал сбора (часы)</label>
            <input
              type="number"
              name="collection_interval_hours"
              value={settings.collection_interval_hours}
              onChange={handleChange}
              min="1"
              max="48"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Минимальный период сбора */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Минимальный период сбора (часы)</label>
            <input
              type="number"
              name="min_collection_period_hours"
              value={settings.min_collection_period_hours}
              onChange={handleChange}
              min="1"
              max={settings.collection_interval_hours}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Максимальный период сбора */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Максимальный период сбора (часы)</label>
            <input
              type="number"
              name="max_collection_period_hours"
              value={settings.max_collection_period_hours}
              onChange={handleChange}
              min={settings.collection_interval_hours}
              max="72"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Базовая ставка награды */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Базовая ставка награды (монет за единицу хешрейта в час)
            </label>
            <input
              type="number"
              name="base_reward_rate"
              value={settings.base_reward_rate}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 rounded-lg text-sm font-medium transition-all
            bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </button>
      </form>
    </div>
  )
}

export default MiningSettings

