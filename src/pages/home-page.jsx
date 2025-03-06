"use client"

import { useState } from "react"
import MiningRewards from "../components/mining-rewards"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"

const HomePage = ({ user, minersData: initialMinersData, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [minersData, setMinersData] = useState(initialMinersData || {})
  const [userBalance, setUserBalance] = useState(user?.balance || 0)

  // Получаем общий хешрейт и множитель пула
  const totalHashrate =
    minersData?.miners?.reduce((sum, miner) => {
      return sum + (miner.model?.mining_power || 0) * miner.quantity
    }, 0) || 0

  const poolMultiplier = minersData?.pool?.multiplier || 1

  // Обработчик обновления баланса
  const handleBalanceUpdate = (newBalance) => {
    console.log("Updating balance to:", newBalance)
    setUserBalance(newBalance)

    // Если есть родительский обработчик, вызываем его
    if (typeof onPurchase === "function") {
      onPurchase(newBalance)
    }
  }

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
      <MiningRewards
        userId={user.id}
        onCollect={handleBalanceUpdate}
        balance={userBalance}
        totalHashrate={totalHashrate}
        poolMultiplier={poolMultiplier}
      />
      <MyMiners miners={minersData?.miners || []} miningStats={minersData?.stats || {}} />
      <MiningPoolSelector userId={user.id} onPoolChange={() => {}} />
    </div>
  )
}

export default HomePage

