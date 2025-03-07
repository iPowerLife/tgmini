"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"
import MiningRewards from "../components/mining-rewards"

const HomePage = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [miningInfo, setMiningInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("HomePage mounted with user:", user?.id)

    return () => {
      console.log("HomePage unmounted")
    }
  }, [user?.id])

  useEffect(() => {
    if (!user) return

    const loadMiningInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        })

        if (error) throw error

        setMiningInfo(data)
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных майнинга")
      } finally {
        setIsLoading(false)
      }
    }

    loadMiningInfo()
  }, [user])

  const handlePoolChange = () => {
    if (!user) return

    const loadMiningInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        })

        if (error) throw error

        setMiningInfo(data)
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных майнинга")
      } finally {
        setIsLoading(false)
      }
    }

    loadMiningInfo()
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <MiningRewards userId={user.id} />
          <MyMiners
            miners={miningInfo?.miners || []}
            miningStats={miningInfo?.stats || {}}
            hourlyRate={miningInfo?.rewards?.hourly_rate || 0}
          />
          <MiningPoolSelector userId={user.id} onPoolChange={handlePoolChange} />
        </>
      )}
    </div>
  )
}

export default HomePage

