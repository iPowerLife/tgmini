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

      setLoading(true) // Fix: Move setLoading(true) before the try block

      try {
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
    },
    [currentPool, userId, onPoolChange]
  )

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

      <div className="flex">
        {/* Вертикальные вкладки */}
        <div className="w-1/4 pr-2">
          <div className="space-y-1">
            {pools.map((pool) => {
              const color = getPoolColor(pool.name)
              const isActive = selectedPool === pool.name
              const isDisabled = isPoolDisabled(pool)

              return (
                <div
                  key={pool.id}
                  onClick={() => !isDisabled && setSelectedPool(pool.name)}
                  className={`
                  p-2 rounded-lg text-center text-sm font-medium cursor-pointer
                  ${isActive ? `bg-${color}-900/30 border border-${color}-500/20` : "bg-gray-800"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-750"}
                `}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full bg-${color}-500 mb-1`}></div>
                    <span className="text-xs">{pool.display_name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Информация о выбранном пуле */}
        <div className="w-3/4 pl-2">
          <div className={`bg-gray-800 rounded-lg p-3 border border-${getPoolColor(selectedPoolInfo.name)}-500/20`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${getPoolColor(selectedPoolInfo.name)}-500`}></div>
                <span className="font-medium">{selectedPoolInfo.display_name}</span>
              </div>
              {currentPool === selectedPoolInfo.name && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Активен</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap size={14} className={`text-${getPoolColor(selectedPoolInfo.name)}-400`} />
                <span>Множитель: {selectedPoolInfo.multiplier}x</span>
              </div>
              <div className="flex items-center gap-2">
                <Percent size={14} className={`text-${getPoolColor(selectedPoolInfo.name)}-400`} />
                <span>Комиссия: {selectedPoolInfo.fee_percent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span>Мин. майнеров: {selectedPoolInfo.min_miners}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <span className="text-gray-400">{selectedPoolInfo.description}</span>
              </div>
            </div>

            {selectedPool !== currentPool && (
              <button
                onClick={() => handlePoolChange(selectedPoolInfo.name)}
                disabled={isPoolDisabled(selectedPoolInfo) || loading}
                className={`
                w-full mt-3 py-2 rounded-lg text-sm font-medium
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
      </div>
    </div>
  )
}

export default MiningPoolSelector

