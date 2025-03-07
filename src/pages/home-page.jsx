"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { MiningPoolSelector } from "../components/mining-pool-selector"
import { MyMiners } from "../components/my-miners" // Используем существующий компонент MyMiners вместо MinerCard

const HomePage = ({
  user,
  balance,
  minersData,
  ratingData,
  transactionsData,
  ranksData,
  onPurchase,
  cachedMiningInfo,
  onCacheUpdate,
}) => {
  const [miningData, setMiningData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [miningInfo, setMiningInfo] = useState(null)
  const isInitialMount = useRef(true)
  const dataFetchedRef = useRef(false)

  // Используем кэшированные данные, если они доступны
  useEffect(() => {
    if (!user) return

    // Функция для загрузки данных майнинга
    const loadMiningInfo = async () => {
      try {
        if (!cachedMiningInfo) {
          setLoading(true)
        }
        setError(null)

        const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        })

        if (error) throw error

        setMiningInfo(data)
        if (onCacheUpdate) {
          onCacheUpdate(data)
        }
        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error loading mining info:", err)
        setError("Ошибка при загрузке данных майнинга")
      } finally {
        setLoading(false)
      }
    }

    // Загружаем данные только при первом монтировании или если данные еще не загружены
    if (isInitialMount.current || !dataFetchedRef.current) {
      loadMiningInfo()
      isInitialMount.current = false
    }
  }, [user, onCacheUpdate, cachedMiningInfo])

  const loadMiningData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      console.log("Loading mining data...")
      const { data, error } = await supabase.rpc("get_mining_info_with_rewards", {
        user_id_param: user.id,
      })

      if (error) throw error

      console.log("Mining data loaded:", data)
      setMiningData(data)

      // Обновляем кэш
      if (onCacheUpdate) {
        onCacheUpdate(data)
      }
    } catch (err) {
      console.error("Error loading mining data:", err)
      setError("Не удалось загрузить данные майнинга")
    } finally {
      setLoading(false)
    }
  }

  const handlePoolChange = () => {
    // Функция для обновления данных после смены пула
    loadMiningData()
  }

  // Получаем hourlyRate из miningInfo или используем значение по умолчанию
  const hourlyRate = miningInfo?.rewards?.hourly_rate || 0

  return (
    <div className="home-page">
      <div className="balance-card">
        <div className="balance-background" />
        <div className="balance-content">
          <div className="balance-label">Баланс</div>
          <div className="balance-amount">
            <span>{balance.toFixed(2)}</span>
            <span className="balance-currency">💎</span>
          </div>
        </div>
      </div>

      {/* Секция с майнером пользователя - используем MyMiners вместо MinerCard */}
      <MyMiners miners={minersData.miners} miningStats={miningInfo?.stats || {}} hourlyRate={hourlyRate} />

      {/* Секция с пулом майнинга */}
      <div className="section-container">
        <MiningPoolSelector
          user={user}
          onPoolChange={handlePoolChange}
          initialData={cachedMiningInfo}
          cachedMiningInfo={cachedMiningInfo}
          onCacheUpdate={onCacheUpdate}
        />
      </div>
    </div>
  )
}

export default HomePage

