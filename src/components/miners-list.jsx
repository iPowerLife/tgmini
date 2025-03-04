"use client"

export function MinersList({ miners, totalPower }) {
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
          <div key={miner.id} className="miner-card">
            <h3>{miner.model.display_name}</h3>
            <div className="stats">
              <div>Количество: {miner.quantity}</div>
              <div>Мощность: {miner.model.mining_power}</div>
              <div>Энергия: {miner.model.energy_consumption}</div>
              <div>Добыто: {miner.total_mined.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

