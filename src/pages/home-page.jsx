"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"
import MiningRewards from "../components/mining-rewards"

const HomePage = ({ user, cachedMiningInfo, onCacheUpdate }) => {
  const [miningInfo, setMiningInfo] = useState(cachedMiningInfo || null)
  const [error, setError] = useState(null)
  const isInitialMount = useRef(true)
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    console.log("HomePage mounted with user:", user?.id)

    return () => {
      console.log("HomePage unmounted")
    }
  }, [user?.id])

  useEffect(() => {
    if (!user) return

    // Функция для загрузки данных майнинга
    const loadMiningInfo = async () => {
      try {
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
      }
    }

    // Загружаем данные только при первом монтировании или если данные еще не загружены
    if (isInitialMount.current || !dataFetchedRef.current) {
      loadMiningInfo()
      isInitialMount.current = false
    }
  }, [user])

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

  // Всегда отображаем компоненты, даже если данные еще не загружены
  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <MiningRewards userId={user.id} />
      <MyMiners
        miners={miningInfo?.miners || []}
        miningStats={miningInfo?.stats || {}}
        hourlyRate={miningInfo?.rewards?.hourly_rate || 0}
      />
      <MiningPoolSelector userId={user.id} onPoolChange={handlePoolChange} />
    </div>
  )
}

export default HomePage

