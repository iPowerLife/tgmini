"use client"

export function RatingSection({ currentUserId, users }) {
  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6">
        {/* Список пользователей */}
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user.id}
              className={`
                relative overflow-hidden rounded-xl backdrop-blur-sm border
                ${user.id === currentUserId ? "bg-blue-900/30 border-blue-500/30" : "bg-gray-800/50 border-gray-700/50"}
              `}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Ранг */}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 font-bold text-white">
                  {index + 1}
                </div>

                {/* Аватар */}
                <div className="relative">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url || "/placeholder.svg"}
                      alt={user.display_name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-700/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center border border-gray-700/50">
                      <span className="text-lg font-bold text-gray-400">{user.display_name[0]}</span>
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
                    <p className="text-sm font-medium text-white">{user.total_mined.toFixed(2)} 💎</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-gray-400">Мощность: {user.mining_power.toFixed(3)} ⚡</p>
                    <p className="text-xs text-gray-400">Майнеров: {user.miners_count}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Данные загружаются...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

