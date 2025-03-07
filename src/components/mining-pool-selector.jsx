"use client"

import { useState, useEffect, useRef } from "react"
import { Database, Zap, Percent, AlertCircle, Info, Users } from "lucide-react"
import { supabase } from "../supabase"

// Обновляем компонент MiningPoolSelector для использования initialData

// Добавляем initialData в параметры компонента
export const MiningPoolSelector = ({ userId, onPoolChange, initialData }) => {
  const [loading, setLoading] = useState(!initialData) // Если есть initialData, не показываем загрузку
  const [pools, setPools] = useState([])
  const [currentPool, setCurrentPool] = useState(initialData?.pool?.name || null)
  const [selectedPool, setSelectedPool] = useState(initialData?.pool?.name || null)
  const [minerCount, setMinerCount] = useState(initialData?.miners?.length || 0)
  const [hasMinerPass, setHasMinerPass] = useState(initialData?.has_miner_pass || false)
  const [error, setError] = useState(null)

  // Используем useRef для отслеживания монтирования компонента
  const isComponentMounted = useRef(true)

  // Загрузка данных
  useEffect(() => {
    if (!userId) return

    isComponentMounted.current = true

    const loadData = async () => {
      // Если у нас уже есть initialData, не показываем состояние загрузки
      // и не делаем запрос к серверу, если у нас есть все необходимые данные
      if (initialData && initialData.pool) {
        const poolName = initialData.pool?.name || "standard"
        setCurrentPool(poolName)
        setSelectedPool(poolName)
        setHasMinerPass(initialData.has_miner_pass || false)
        setMinerCount(initialData.miners?.length || 0)

        // Загружаем только список пулов, если у нас нет этих данных
        if (pools.length === 0) {
          try {
            const { data: poolsData, error: poolsError } = await supabase
              .from("mining_pools")
              .select("*")
              .order("min_miners")

            if (!isComponentMounted.current) return
            if (poolsError) throw poolsError
            setPools(poolsData || [])
          } catch (err) {
            console.error("Error loading pools:", err)
            if (isComponentMounted.current) {
              setError("Ошибка при загрузке пулов")
            }
          } finally {
            if (isComponentMounted.current) {
              setLoading(false)
            }
          }
        } else {
          setLoading(false)
        }
        return
      }

      // Если нет initialData, загружаем все данные
      try {
        setLoading(true)
        setError(null)

        const { data: miningInfo, error: miningError } = await supabase.rpc("get_mining_info", {
          user_id_param: userId,
        })

        if (!isComponentMounted.current) return
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

        if (!isComponentMounted.current) return
        if (poolsError) throw poolsError
        setPools(poolsData || [])
      } catch (err) {
        console.error("Error loading data:", err)
        if (isComponentMounted.current) {
          setError("Ошибка при загрузке данных")
        }
      } finally {
        if (isComponentMounted.current) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isComponentMounted.current = false
    }
  }, [userId, initialData, pools.length])

  // Смена пула
  const handlePoolChange = async (poolId) => {
    if (poolId === currentPool || !isComponentMounted.current) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc("change_mining_pool", {
        user_id_param: userId,
        pool_name_param: poolId,
      })

      if (!isComponentMounted.current) return

      if (error) throw error

      if (data && data.success) {
        setCurrentPool(poolId)
        if (onPoolChange) onPoolChange(poolId)
        alert(`Пул майнинга изменен на ${poolId}`)
      } else if (data && data.error) {
        setError(data.error)
      } else {
        setError("Неизвестная ошибка при смене пула")
      }
    } catch (err) {
      console.error("Error changing pool:", err)
      if (isComponentMounted.current) {
        setError("Ошибка при смене пула")
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false)
      }
    }
  }

  // Если пулы не загрузились, показываем сообщение об ошибке
  if (!pools || pools.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="text-blue-500" size={18} />
          <span className="font-medium">Пул майнинга</span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Информация о пулах недоступна</div>
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
      {/* Заголовок */}
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
      <div className="mb-3">
        <div className="flex gap-2">
          {pools.map((pool) => {
            const isActive = selectedPool === pool.name
            const isDisabled = isPoolDisabled(pool)

            return (
              <button
                key={pool.id}
                onClick={() => !isDisabled && setSelectedPool(pool.name)}
                disabled={isDisabled}
                className={`
                px-3 py-1.5 text-sm rounded-lg transition-all whitespace-nowrap
                ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              >
                {pool.display_name || pool.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Информация о выбранном пуле */}
      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
        {/* Название пула */}
        <div className="flex items-center gap-2">
          <Database className="text-blue-500" size={16} />
          <span className="font-medium">{selectedPoolInfo.display_name || selectedPoolInfo.name}</span>
          {currentPool === selectedPoolInfo.name && <span className="text-xs text-green-400 ml-auto">Активен</span>}
        </div>

        {/* Множитель и комиссия */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-2 flex items-center">
            <Zap size={14} className="text-blue-400 mr-2" />
            <span className="text-xs text-gray-400 mr-2">Множитель</span>
            <span className="text-sm font-medium ml-auto">{selectedPoolInfo.multiplier}x</span>
          </div>

          <div className="bg-gray-800 rounded-lg p-2 flex items-center">
            <Percent size={14} className="text-blue-400 mr-2" />
            <span className="text-xs text-gray-400 mr-2">Комиссия</span>
            <span className="text-sm font-medium ml-auto">{selectedPoolInfo.fee_percent}%</span>
          </div>
        </div>

        {/* Требования */}
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">
            {selectedPoolInfo.min_miners > 0 ? (
              <>Минимум {selectedPoolInfo.min_miners} майнеров</>
            ) : (
              <>Нет требований</>
            )}
            {selectedPoolInfo.name === "premium" && <span className="text-yellow-400 ml-1">(или Mining Pass)</span>}
          </span>
        </div>

        {/* Описание */}
        <div className="flex items-center gap-2 text-sm">
          <Info size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-400 truncate">{selectedPoolInfo.description || "Нет описания"}</span>
        </div>

        {/* Кнопка выбора пула */}
        {selectedPool !== currentPool && (
          <button
            onClick={() => handlePoolChange(selectedPoolInfo.name)}
            disabled={isPoolDisabled(selectedPoolInfo) || loading}
            className={`
            w-full py-2 rounded-lg text-sm font-medium transition-all
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

