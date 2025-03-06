"use client"

import { useState, useEffect } from "react"
import MiningRewards from "../components/mining-rewards"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"

const HomePage = ({ user, minersData, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("HomePage rendered with user:", user?.id)
    console.log("minersData:", minersData)
    console.log("miners array:", minersData?.miners)
    console.log("mining stats:", minersData?.stats)
  }, [user, minersData])

  // Если пользователь не загружен, показываем загрузку
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* Компоненты майнинга */}
      <MiningRewards userId={user.id} onCollect={onPurchase} />
      <MyMiners
        miners={Array.isArray(minersData?.miners) ? minersData.miners : []}
        miningStats={typeof minersData?.stats === "object" ? minersData.stats : {}}
      />
      <MiningPoolSelector userId={user.id} onPoolChange={() => {}} />
    </div>
  )
}

export default HomePage

