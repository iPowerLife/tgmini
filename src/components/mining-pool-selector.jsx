"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "../supabase"

export const MiningPoolSelector = ({ user, cachedMiningInfo, onCacheUpdate, initialData }) => {
  const [selectedPool, setSelectedPool] = useState(null)
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [miningInfo, setMiningInfo] = useState(null)

  // Используем кэшированные данные, если они доступны
  useEffect(() => {
    if (initialData) {
      console.log("Using cached mining info:", initialData)
      setSelectedPool(initialData.pool?.name || null)
      setPools(initialData.available_pools || [])
      setLoading(false)
    }
  }, [initialData])

  // Функция загрузки данных о майнинге
  const loadMiningInfo = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      console.log("Loading mining info...")
      const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
        user_id_param: user.id,
      })

      if (error) throw error

      console.log("Mining info loaded:", data)
      setMiningInfo(data)
      setSelectedPool(data.current_pool?.id || null)
      setPools(data.available_pools || [])

      // Обновляем кэш
      if (onCacheUpdate) {
        onCacheUpdate(data)
      }
    } catch (err) {
      console.error("Error loading mining info:", err)
      setError("Не удалось загрузить информацию о майнинге")
    } finally {
      setLoading(false)
    }
  }

  // Обработчик выбора пула
  const handlePoolSelect = async (poolId) => {
    if (!user?.id || loading) return

    try {
      setLoading(true)
      setError(null)

      console.log("Selecting pool:", poolId)
      const { data, error } = await supabase.rpc("select_mining_pool", {
        user_id_param: user.id,
        pool_id_param: poolId,
      })

      if (error) throw error

      // Обновляем данные после выбора пула
      await loadMiningInfo()
      setSelectedPool(poolId)
    } catch (err) {
      console.error("Error selecting pool:", err)
      setError("Не удалось выбрать пул майнинга")
    } finally {
      setLoading(false)
    }
  }

  // Вычисляем текущий пул
  const currentPool = useMemo(() => {
    if (!pools.length || !selectedPool) return null
    return pools.find((pool) => pool.id === selectedPool)
  }, [pools, selectedPool])

  // Скелетон для загрузки
  const renderSkeleton = () => (
    <div className="mining-pool-selector">
      <div className="mining-pool-header">
        <div className="h-6 w-32 bg-gray-700 animate-pulse rounded"></div>
      </div>
      <div className="mining-pool-content">
        <div className="mining-pool-current">
          <div className="h-5 w-24 bg-gray-700 animate-pulse rounded mb-2"></div>
          <div className="h-8 w-full bg-gray-700 animate-pulse rounded"></div>
        </div>
        <div className="mining-pool-list">
          <div className="h-5 w-32 bg-gray-700 animate-pulse rounded mb-2"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Если данные загружаются и нет кэшированных данных, показываем скелетон
  if (loading && !miningInfo) {
    return renderSkeleton()
  }

  // Если произошла ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <div className="mining-pool-selector error">
        <div className="mining-pool-header">
          <h3>Пул майнинга</h3>
        </div>
        <div className="mining-pool-content">
          <div className="error-message">{error}</div>
          <button onClick={loadMiningInfo} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  // Если нет данных, показываем сообщение
  if (!miningInfo || !pools.length) {
    return (
      <div className="mining-pool-selector">
        <div className="mining-pool-header">
          <h3>Пул майнинга</h3>
        </div>
        <div className="mining-pool-content">
          <div className="no-data-message">Нет доступных пулов майнинга</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mining-pool-selector">
      <div className="mining-pool-header">
        <h3>Пул майнинга</h3>
      </div>
      <div className="mining-pool-content">
        <div className="mining-pool-current">
          <h4>Текущий пул</h4>
          <div className="current-pool">
            {currentPool ? (
              <>
                <div className="pool-name">{currentPool.name}</div>
                <div className="pool-bonus">+{currentPool.bonus_percent}% к добыче</div>
              </>
            ) : (
              <div className="no-pool-selected">Пул не выбран</div>
            )}
          </div>
        </div>
        <div className="mining-pool-list">
          <h4>Доступные пулы</h4>
          <div className="pools-grid">
            {pools.map((pool) => (
              <button
                key={pool.id}
                className={`pool-item ${selectedPool === pool.id ? "selected" : ""} ${loading ? "disabled" : ""}`}
                onClick={() => handlePoolSelect(pool.id)}
                disabled={loading}
              >
                <div className="pool-name">{pool.name}</div>
                <div className="pool-bonus">+{pool.bonus_percent}%</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

