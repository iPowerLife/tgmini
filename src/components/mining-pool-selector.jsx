"use client"

import { useState, useEffect } from "react"
import { Database, Zap, Percent, AlertCircle, Info, Users } from "lucide-react"
import { supabase } from "../supabase"

export const MiningPoolSelector = ({ userId, onPoolChange }) => {
  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState([])
  const [currentPool, setCurrentPool] = useState(null)
  const [selectedPool, setSelectedPool] = useState(null)
  const [minerCount, setMinerCount] = useState(0)
  const [hasMinerPass, setHasMinerPass] = useState(false)
  const [error, setError] = useState(null)

  // Загрузка данных
  useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загружаем информацию о майнинге
        const { data: miningInfo, error: miningError } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (miningError) throw miningError

        // Устанавливаем текущий пул и наличие Miner Pass
        if (miningInfo) {
          const poolName = miningInfo.pool?.name || "standard"
          setCurrentPool(poolName)
          setSelectedPool(poolName)
          setHasMinerPass(miningInfo.has_miner_pass || false)
          setMinerCount(miningInfo.miners?.length || 0)
        }

        // Загружаем все доступные пулы
        const { data: poolsData, error: poolsError } = await supabase
          .from("mining_pools")
          .select("*")
          .order("min_miners")

        if (poolsError) throw poolsError

        setPools(poolsData || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  // Смена пула
  const handlePoolChange = async (poolId) => {
    if (poolId === currentPool) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("change_mining_pool", {
        user_id_param: userId,
        pool_name_param: poolId,
      })

      if (error) throw error

      if (data.success) {
        setCurrentPool(poolId)
        if (onPoolChange) onPoolChange(poolId)
        alert(`Пул майнинга изменен на ${poolId}`)
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error("Error changing pool:", err)
      setError("Ошибка при смене пула")
    } finally {
      setLoading(false)
    }
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Database className="text-blue-500" size={18} />
            <span className="font-medium">Пул майнинга</span>
          </div>
        </div>
        <div className="flex justify-center items-center py-6">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Получаем выбранный пул
  const selectedPoolInfo = pools.find((pool) => pool.name === selectedPool) || pools[0]

  // Определяем цвет для пула
  const getPoolColor = (poolName) => {
    switch (poolName) {
      case "premium":
        return "yellow"
      case "advanced":
        return "purple"
      default:
        return "blue"
    }
  }

  // Проверяем, доступен ли пул
  const isPoolDisabled = (pool) => {
    return pool.min_miners > 0 && minerCount < pool.min_miners && !(pool.name === "premium" && hasMinerPass)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Database className="text-blue-500" size={18} />
          <span className="font-medium">Пул майнинга</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      {/* Горизонтальные вкладки */}
      <div className="mb-3">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {pools.map((pool) => {
            const color = getPoolColor(pool.name)
            const isActive = selectedPool === pool.name
            const isDisabled = isPoolDisabled(pool)

            return (
              <div
                key={pool.id}
                onClick={() => !isDisabled && setSelectedPool(pool.name)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-center cursor-pointer transition-all
                  ${isActive ? `bg-${color}-900/30 border border-${color}-500/20` : "bg-gray-800"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-750"}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                  <span className="text-sm font-medium whitespace-nowrap">{pool.display_name}</span>
                  {currentPool === pool.name && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Активен</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Информация о выбранном пуле */}
      <div className={`bg-gray-800 rounded-lg p-4 border border-${getPoolColor(selectedPoolInfo.name)}-500/20`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${getPoolColor(selectedPoolInfo.name)}-500`}></div>
            <span className="font-medium text-lg">{selectedPoolInfo.display_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`bg-gray-750 rounded-lg p-3 border border-${getPoolColor(selectedPoolInfo.name)}-500/10`}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className={`text-${getPoolColor(selectedPoolInfo.name)}-400`} />
              <span className="text-sm font-medium">Множитель</span>
            </div>
            <div className={`text-xl font-bold text-${getPoolColor(selectedPoolInfo.name)}-400`}>
              {selectedPoolInfo.multiplier}x
            </div>
          </div>

          <div className={`bg-gray-750 rounded-lg p-3 border border-${getPoolColor(selectedPoolInfo.name)}-500/10`}>
            <div className="flex items-center gap-2 mb-1">
              <Percent size={16} className={`text-${getPoolColor(selectedPoolInfo.name)}-400`} />
              <span className="text-sm font-medium">Комиссия</span>
            </div>
            <div className={`text-xl font-bold text-${getPoolColor(selectedPoolInfo.name)}-400`}>
              {selectedPoolInfo.fee_percent}%
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-medium">Требования</span>
          </div>
          <div className="bg-gray-750 rounded-lg p-3">
            <div className="text-sm">
              {selectedPoolInfo.min_miners > 0 ? (
                <>
                  Минимум <span className="font-medium">{selectedPoolInfo.min_miners}</span> майнеров
                </>
              ) : (
                <>Нет требований</>
              )}
              {selectedPoolInfo.name === "premium" && <span className="ml-2 text-yellow-400">(или Mining Pass)</span>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-gray-400" />
            <span className="text-sm font-medium">Описание</span>
          </div>
          <div className="bg-gray-750 rounded-lg p-3">
            <div className="text-sm text-gray-300">{selectedPoolInfo.description}</div>
          </div>
        </div>

        {selectedPool !== currentPool && (
          <button
            onClick={() => handlePoolChange(selectedPoolInfo.name)}
            disabled={isPoolDisabled(selectedPoolInfo) || loading}
            className={`
              w-full py-3 rounded-lg text-sm font-medium transition-all
              ${
                isPoolDisabled(selectedPoolInfo) || loading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : `bg-${getPoolColor(selectedPoolInfo.name)}-500/20 text-${getPoolColor(selectedPoolInfo.name)}-400 hover:bg-${getPoolColor(selectedPoolInfo.name)}-500/30`
              }
            `}
          >
            {loading ? "Загрузка..." : "Выбрать пул"}
          </button>
        )}
      </div>
    </div>
  )
}

export default MiningPoolSelector

