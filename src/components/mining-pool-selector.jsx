"use client"

import { useState, useEffect } from "react"
import { Database, Shield, Zap, Percent, AlertCircle } from "lucide-react"
import { supabase } from "../supabase"

export const MiningPoolSelector = ({ userId, onPoolChange }) => {
  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState([])
  const [currentPool, setCurrentPool] = useState(null)
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
          setCurrentPool(miningInfo.pool?.name || "standard")
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

      <div className="space-y-2">
        {pools.map((pool) => {
          // Определяем цвет для пула
          const color = pool.name === "premium" ? "yellow" : pool.name === "advanced" ? "purple" : "blue"

          // Проверяем, доступен ли пул
          const isDisabled =
            pool.min_miners > 0 && minerCount < pool.min_miners && !(pool.name === "premium" && hasMinerPass)

          return (
            <div
              key={pool.id}
              onClick={() => !isDisabled && !loading && handlePoolChange(pool.name)}
              className={`
                bg-gray-800 rounded-lg p-3 border border-${color}-500/20
                ${currentPool === pool.name ? `bg-${color}-900/30` : ""}
                ${isDisabled ? "opacity-50" : "cursor-pointer hover:bg-gray-750"}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                  <span className="font-medium">{pool.display_name}</span>
                </div>
                {currentPool === pool.name && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Активен</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Zap size={12} className={`text-${color}-400`} />
                  <span>Множитель: {pool.multiplier}x</span>
                </div>
                <div className="flex items-center gap-1">
                  <Percent size={12} className={`text-${color}-400`} />
                  <span>Комиссия: {pool.fee_percent}%</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <Shield size={12} className="text-gray-400" />
                  <span>{pool.description}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MiningPoolSelector

