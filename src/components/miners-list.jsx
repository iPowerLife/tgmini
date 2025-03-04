"use client"
import { memo } from "react"
import { MinerItem } from "./miner-item"

export const MinersList = memo(function MinersList({ miners, totalPower }) {
  if (!miners?.length) {
    return (
      <div className="section-container empty">
        <p>У вас пока нет майнеров</p>
        <p>Купите майнеры в магазине, чтобы начать добывать монеты</p>
      </div>
    )
  }

  return (
    <div className="miners-container">
      <div className="total-power">Общая мощность: {totalPower.toFixed(3)} ⚡</div>

      <div className="miners-grid">
        {miners.map((miner) => (
          <MinerItem key={miner.id} miner={miner} />
        ))}
      </div>
    </div>
  )
})

