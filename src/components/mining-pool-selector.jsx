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

        const { data: miningInfo, error: miningError } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (miningError) throw miningError

        if (miningInfo) {
          const poolName = miningInfo.pool?.name || "standard"
          setCurrentPool(poolName)
          setSelectedPool(poolName)
          setHasMinerPass(miningInfo.has_miner_pass || false)
          setMinerCount(miningInfo.miners?.length || 0)
        }

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

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="text-blue-500" size={18} />
          <span className="font-medium">Пул майнинга</span>
        </div>
        <div className="flex justify-center items-center py-6">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const selectedPoolInfo = pools.find((pool) => pool.name === selectedPool) || pools[0]

  const isPoolDisabled = (pool) => {
    return pool.min_miners > 0 && minerCount < pool.min_miners && !(pool.name === "premium" && hasMinerPass)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="text-blue-500" size={18} />
        <span className="font-medium">Пул майнинга</span>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      {/* Вкладки пулов */}
      <div className="bg-gray-800/50 rounded-lg p-1 mb-3">
        <div className="flex">
          {pools.map((pool) => {
            const isActive = selectedPool === pool.name
            const isDisabled = isPoolDisabled(pool)

            return (
              <button
                key={pool.id}
                onClick={() => !isDisabled && setSelectedPool(pool.name)}
                disabled={isDisabled}
                className={`
                  flex-1 px-3 py-2 text-sm rounded-md transition-all
                  ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {pool.display_name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Информация о выбранном пуле */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="text-blue-500" size={16} />
            <span className="font-medium">{selectedPoolInfo.display_name}</span>
            <span className="text-sm text-gray-500">
              {selectedPoolInfo.name === "standard"
                ? "Базовый пул"
                : selectedPoolInfo.name === "advanced"
                  ? "Продвинутый пул"
                  : "Премиум пул"}
            </span>
          </div>
          {currentPool === selectedPoolInfo.name && <span className="text-xs text-green-400">Активен</span>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">Множитель</span>
            </div>
            <div className="text-lg font-medium">{selectedPoolInfo.multiplier}x</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">Комиссия</span>
            </div>
            <div className="text-lg font-medium">{selectedPoolInfo.fee_percent}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm">
              {selectedPoolInfo.min_miners > 0 ? (
                <>Минимум {selectedPoolInfo.min_miners} майнеров</>
              ) : (
                <>Нет требований</>
              )}
              {selectedPoolInfo.name === "premium" && <span className="text-yellow-400 ml-1">(или Mining Pass)</span>}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info size={14} className="text-gray-400" />
            <span className="text-sm text-gray-400">{selectedPoolInfo.description}</span>
          </div>
        </div>

        {selectedPool !== currentPool && (
          <button
            onClick={() => handlePoolChange(selectedPoolInfo.name)}
            disabled={isPoolDisabled(selectedPoolInfo) || loading}
            className={`
              w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isPoolDisabled(selectedPoolInfo) || loading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-400"
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

