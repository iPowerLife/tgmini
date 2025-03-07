"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { MiningPoolSelector } from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"
import MiningRewards from "../components/mining-rewards"

const HomePage = ({ user, cachedMiningInfo, onCacheUpdate }) => {
  const [miningInfo, setMiningInfo] = useState(cachedMiningInfo || null)
  const [loading, setLoading] = useState(!cachedMiningInfo) // Если есть кэш, не показываем загрузку
  const [error, setError] = useState(null)
  const isInitialMount = useRef(true)
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    console.log("HomePage mounted with user:", user?.id)
    console.log("Using cached mining info:", !!cachedMiningInfo)

    return () => {
      console.log("HomePage unmounted")
    }
  }, [user?.id, cachedMiningInfo])

  useEffect(() => {
    if (!user) return

    // Функция для загрузки данных майнинга
    const loadMiningInfo = async () => {
      try {
        if (!cachedMiningInfo) {
          setLoading(true)
        }
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        })

        if (error) throw error

        setMiningInfo(data)
        if (onCacheUpdate) {
          onCacheUpdate(data)
        }
        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных майнинга")
      } finally {
        setLoading(false)
      }
    }

    // Загружаем данные только при первом монтировании или если данные еще не загружены
    if (isInitialMount.current || !dataFetchedRef.current) {
      loadMiningInfo()
      isInitialMount.current = false
    }
  }, [user, onCacheUpdate, cachedMiningInfo])

  const handlePoolChange = () => {
    if (!user) return

    // Обновляем данные при смене пула
    const loadMiningInfo = async () => {
      try {
        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        })

        if (error) throw error

        setMiningInfo(data)
        if (onCacheUpdate) {
          onCacheUpdate(data)
        }
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных майнинга")
      }
    }

    loadMiningInfo()
  }

  // Если пользователь не авторизован, не показываем ничего
  if (!user) {
    return null
  }

  // Показываем загрузку для всей страницы, если данные еще не загружены
  if (loading && !miningInfo) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Всегда отображаем компоненты с данными из кэша или загруженными данными
  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <MiningRewards userId={user.id} initialData={miningInfo} />
      <MyMiners
        miners={miningInfo?.miners || []}
        miningStats={miningInfo?.stats || {}}
        hourlyRate={miningInfo?.rewards?.hourly_rate || 0}
      />
      <MiningPoolSelector userId={user.id} onPoolChange={handlePoolChange} initialData={miningInfo} />
    </div>
  )
}

export default HomePage

