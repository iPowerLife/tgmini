"use client"

export function UserProfile({ user, miners, totalPower }) {
  if (!user) return null

  const stats = {
    total_mined: miners.reduce((sum, miner) => sum + (miner.total_mined || 0), 0),
    mining_count: miners.length,
    mining_power: totalPower,
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6">
        {/* Профиль */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="relative">
              {user.photo_url ? (
                <img
                  src={user.photo_url || "/placeholder.svg"}
                  alt={user.display_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-700/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-700/50 flex items-center justify-center border-2 border-gray-700/50">
                  <span className="text-2xl font-bold text-gray-400">{user.display_name[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{user.display_name}</h2>
              <p className="text-sm text-gray-400 font-mono">ID: {user.id}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.total_mined.toFixed(2)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Всего намайнено 💎</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.mining_count}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Кол-во майнеров</div>
          </div>

          <div className="col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stats.mining_power.toFixed(3)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Общая мощность ⚡</div>
          </div>
        </div>

        {/* Список майнеров */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Ваши майнеры</h3>
          <div className="space-y-2">
            {miners.map((miner) => (
              <div
                key={miner.id}
                className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0"
              >
                <span className="text-white">{miner.model.display_name}</span>
                <span className="text-gray-400">x{miner.quantity}</span>
              </div>
            ))}
            {miners.length === 0 && <div className="text-gray-500 text-sm">У вас пока нет майнеров</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

