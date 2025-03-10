"use client"

import { useState, useEffect, useRef } from "react"
import { UserProfile } from "../components/user-profile"
import { supabase } from "../supabase"

const ProfilePage = ({ user, initialData }) => {
  const [loading, setLoading] = useState(!initialData)
  const [miners, setMiners] = useState(initialData?.miners || [])
  const [totalPower, setTotalPower] = useState(initialData?.totalPower || 0)
  const isComponentMounted = useRef(true)

  // Загрузка данных профиля, если они не были переданы
  useEffect(() => {
    if (!user?.id) return

    isComponentMounted.current = true

    // Если данные уже переданы через props, не загружаем их снова
    if (initialData?.miners) {
      return
    }

    const loadProfileData = async () => {
      try {
        setLoading(true)

        // Загружаем данные майнеров пользователя
        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select(`
            *,
            model:miner_models (
              id,
              name,
              display_name,
              mining_power,
              energy_consumption
            )
          `)
          .eq("user_id", user.id)
          .order("purchased_at")

        if (!isComponentMounted.current) return
        if (minersError) throw minersError

        // Рассчитываем общую мощность
        const power = (minersData || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)

        setMiners(minersData || [])
        setTotalPower(power)
      } catch (error) {
        console.error("Error loading profile data:", error)
      } finally {
        if (isComponentMounted.current) {
          setLoading(false)
        }
      }
    }

    loadProfileData()

    return () => {
      isComponentMounted.current = false
    }
  }, [user?.id, initialData])

  // Если пользователь не авторизован, не показываем ничего
  if (!user) {
    return null
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <UserProfile user={user} miners={miners} totalPower={totalPower} />
    </div>
  )
}

export default ProfilePage

