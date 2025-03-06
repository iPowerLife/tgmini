"use client"

import { useState, useEffect } from "react"
import MiningRewards from "../components/mining-rewards"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"
import { User, Award, TrendingUp } from "lucide-react"

const HomePage = ({ user, balance, minersData, ratingData, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("HomePage rendered with user:", user?.id, "and miners:", minersData?.miners?.length)
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
      {/* Верхняя карточка с балансом */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Ваш баланс</div>
            <div className="text-2xl font-bold">{balance} 💎</div>
          </div>
          <div className="bg-blue-500/20 rounded-full p-2">
            <User className="text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-500" size={18} />
            <span className="text-sm font-medium">Рейтинг</span>
          </div>
          <div className="text-xl font-bold">
            {ratingData?.position || "N/A"}
            <span className="text-sm text-gray-400 ml-1">место</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-500" size={18} />
            <span className="text-sm font-medium">Хешрейт</span>
          </div>
          <div className="text-xl font-bold">
            {minersData?.totalPower || 0}
            <span className="text-sm text-gray-400 ml-1">H/s</span>
          </div>
        </div>
      </div>

      {/* Компоненты майнинга */}
      <MiningRewards userId={user.id} onCollect={onPurchase} />
      <MyMiners miners={minersData?.miners || []} miningStats={minersData?.stats || {}} />
      <MiningPoolSelector userId={user.id} onPoolChange={() => {}} />
    </div>
  )
}

export default HomePage

