"use client"

import { useState, useEffect } from "react"
import { Database, Zap, Percent, AlertCircle, Info, Users, Check } from "lucide-react"
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Database className="text-blue-500" size={18} />
          <span className="font-medium">Пул майнинга</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-red-500/90">{error}</div>
          </div>
        </div>
      )}

      {/* Стильные горизонтальные вкладки */}
      <div className="relative mb-6">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
        <div className="flex space-x-1">
          {pools.map((pool) => {
            const color = getPoolColor(pool.name)
            const isActive = selectedPool === pool.name
            const isDisabled = isPoolDisabled(pool)
            const isCurrent = currentPool === pool.name

            return (
              <button
                key={pool.id}
                onClick={() => !isDisabled && setSelectedPool(pool.name)}
                disabled={isDisabled}
                className={`
                  relative px-4 py-2 rounded-t-lg text-sm font-medium transition-all
                  ${isActive ? `bg-gray-800 text-${color}-400` : "bg-transparent hover:bg-gray-800/50"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                  <span>{pool.display_name}</span>
                  {isCurrent && <Check size={14} className="text-green-400" />}
                </div>
                {isActive && <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${color}-500`}></div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Карточка пула */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {/* Шапка карточки */}
        <div
          className={`bg-${getPoolColor(selectedPoolInfo.name)}-900/30 p-4 border-b border-${getPoolColor(selectedPoolInfo.name)}-500/20`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-${getPoolColor(selectedPoolInfo.name)}-500/20 flex items-center justify-center`}
              >
                <Database className={`text-${getPoolColor(selectedPoolInfo.name)}-400`} size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedPoolInfo.display_name}</h3>
                <p className="text-sm text-gray-400">
                  {selectedPoolInfo.name === "standard"
                    ? "Базовый пул"
                    : selectedPoolInfo.name === "advanced"
                      ? "Продвинутый пул"
                      : "Премиум пул"}
                </p>
              </div>
            </div>
            {currentPool === selectedPoolInfo.name && (
              <div className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs font-medium">Активен</div>
            )}
          </div>
        </div>

        {/* Основная информация */}
        <div className="p-4">
          {/* Характеристики пула */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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

          {/* Требования */}
          <div
            className={`bg-gray-750 rounded-lg p-4 mb-4 border-l-4 border-${getPoolColor(selectedPoolInfo.name)}-500`}
          >
            <div className="flex items-start gap-3">
              <Users className="text-gray-400 mt-0.5" size={18} />
              <div>
                <h4 className="font-medium mb-1">Требования</h4>
                <p className="text-sm text-gray-300">
                  {selectedPoolInfo.min_miners > 0 ? (
                    <>
                      Минимум <span className="font-medium text-white">{selectedPoolInfo.min_miners}</span> майнеров
                    </>
                  ) : (
                    <>Нет требований</>
                  )}
                  {selectedPoolInfo.name === "premium" && (
                    <span className="ml-2 text-yellow-400">(или Mining Pass)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="bg-gray-750 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="text-gray-400 mt-0.5" size={18} />
              <div>
                <h4 className="font-medium mb-1">Описание</h4>
                <p className="text-sm text-gray-300">{selectedPoolInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Кнопка выбора пула */}
          {selectedPool !== currentPool && (
            <button
              onClick={() => handlePoolChange(selectedPoolInfo.name)}
              disabled={isPoolDisabled(selectedPoolInfo) || loading}
              className={`
                w-full py-3 rounded-lg text-sm font-medium transition-all
                ${
                  isPoolDisabled(selectedPoolInfo) || loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : `bg-${getPoolColor(selectedPoolInfo.name)}-500 text-black hover:bg-${getPoolColor(selectedPoolInfo.name)}-400`
                }
              `}
            >
              {loading ? "Загрузка..." : "Выбрать пул"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MiningPoolSelector

