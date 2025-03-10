import { memo } from "react"

// Оптимизированный компонент для отдельного майнера
export const MinerItem = memo(function MinerItem({ miner }) {
  return (
    <div className="miner-card">
      <h3>{miner.model.display_name}</h3>
      <div className="stats">
        <div>Количество: {miner.quantity}</div>
        <div>Мощность: {miner.model.mining_power}</div>
        <div>Энергия: {miner.model.energy_consumption}</div>
        <div>Добыто: {miner.total_mined.toFixed(2)}</div>
      </div>
    </div>
  )
})

