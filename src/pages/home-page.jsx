"use client"

import { useState, useEffect } from "react"
import MiningRewardsNew from "../components/mining-rewards-new"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"
import MiningSettings from "../components/mining-settings"

const HomePage = ({ user, minersData: initialMinersData, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [minersData, setMinersData] = useState(initialMinersData || {})
  const [userBalance, setUserBalance] = useState(user?.balance || 0)

  // Добавляем логирование для отслеживания жизненного цикла компонента
  useEffect(() => {
    console.log("HomePage mounted with user:", user?.id)

    return () => {
      console.log("HomePage unmounted")
    }
  }, [user?.id])

  // Логирование при изменении данных
  useEffect(() => {
    console.log("minersData changed:", minersData?.miners?.length)
  }, [minersData])

  // Логирование при изменении баланса
  useEffect(() => {
    console.log("userBalance changed:", userBalance)
  }, [userBalance])

  // Обработчик обновления баланса
  const handleBalanceUpdate = (newBalance) => {
    console.log("handleBalanceUpdate called with:", newBalance)
    setUserBalance(newBalance)

    // Если есть родительский обработчик, вызываем его
    if (typeof onPurchase === "function") {
      console.log("Calling parent onPurchase")
      onPurchase(newBalance)
    }
  }

  // Если пользователь не загружен, показываем загрузку
  if (!user) {
    console.log("User not loaded, showing loading")
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  console.log("Rendering HomePage with user:", user.id)

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* Используем новый компонент для майнинга */}
      <MiningRewardsNew userId={user.id} onCollect={handleBalanceUpdate} balance={userBalance} />
      <MyMiners miners={minersData?.miners || []} miningStats={minersData?.stats || {}} />
      <MiningPoolSelector userId={user.id} onPoolChange={() => {}} />

      {/* Добавляем компонент настроек майнинга */}
      <MiningSettings userId={user.id} />
    </div>
  )
}

export default HomePage

