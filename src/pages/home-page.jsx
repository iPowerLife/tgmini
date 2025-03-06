"use client"
import MiningRewards from "../components/mining-rewards"
import MiningPoolSelector from "../components/mining-pool-selector"
import MyMiners from "../components/my-miners"

const HomePage = ({ user, minersData, onPurchase }) => {
  // Получаем общий хешрейт и множитель пула
  const totalHashrate =
    minersData?.miners?.reduce((sum, miner) => {
      return sum + (miner.model?.mining_power || 0) * miner.quantity
    }, 0) || 0

  const poolMultiplier = minersData?.pool?.multiplier || 1

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <MiningRewards
        userId={user.id}
        onCollect={onPurchase}
        balance={user.balance || 0}
        totalHashrate={totalHashrate}
        poolMultiplier={poolMultiplier}
      />
      <MyMiners miners={minersData?.miners || []} miningStats={minersData?.stats || {}} />
      <MiningPoolSelector userId={user.id} onPoolChange={() => {}} />
    </div>
  )
}

export default HomePage

