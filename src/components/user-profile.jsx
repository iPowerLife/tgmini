"use client"

export function UserProfile({ user, miners, totalPower }) {
  if (!user) return null

  const stats = {
    total_mined: miners.reduce((sum, miner) => sum + (miner.total_mined || 0), 0),
    mining_count: miners.length,
    mining_power: totalPower,
  }

  return (
    <div className="section-container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar">
            {user.photo_url ? (
              <img src={user.photo_url || "/placeholder.svg"} alt={user.display_name} className="avatar-image" />
            ) : (
              <span>{user.display_name[0]}</span>
            )}
          </div>
          <div className="user-info">
            <h2>{user.display_name}</h2>
            <div className="user-id">ID: {user.id}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_mined.toFixed(2)} 💎</div>
            <div className="stat-label">Всего намайнено</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.mining_count}</div>
            <div className="stat-label">Кол-во майнеров</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.mining_power.toFixed(3)}</div>
            <div className="stat-label">Общая мощность</div>
          </div>
        </div>

        <div className="miners-summary">
          <h3>Ваши майнеры</h3>
          <div className="miners-list">
            {miners.map((miner) => (
              <div key={miner.id} className="miner-item">
                <span>{miner.model.display_name}</span>
                <span>x{miner.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

