"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersList({ user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPower, setTotalPower] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMiners = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("user_miners")
          .select(`
          *,
          model:miner_models (
            id,
            name,
            display_name,
            mining_power,
            energy_consumption
          )
        `)
          .eq("user_id", user.id)
          .order("purchased_at")

        if (error) throw error

        setMiners(data)

        const power = data.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
        setTotalPower(power)
      } catch (error) {
        console.error("Error loading miners:", error)
        setError("Ошибка загрузки майнеров")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadMiners()
    }
  }, [user?.id])

  if (loading) {
    return <div className="section-container">Загрузка майнеров...</div>
  }

  if (error) {
    return <div className="section-container error">{error}</div>
  }

  if (!miners.length) {
    return (
      <div className="section-container empty">
        <p>У вас пока нет майнеров</p>
        <p>Купите майнеры в магазине, чтобы начать добывать монеты</p>
      </div>
    )
  }

  return (
    <div className="miners-container">
      <div className="total-power">Общая мощность: {totalPower.toFixed(3)} ⚡</div>

      <div className="miners-grid">
        {miners.map((miner) => (
          <div key={miner.id} className="miner-card">
            <h3>{miner.model.display_name}</h3>
            <div className="stats">
              <div>Количество: {miner.quantity}</div>
              <div>Мощность: {miner.model.mining_power}</div>
              <div>Энергия: {miner.model.energy_consumption}</div>
              <div>Добыто: {miner.total_mined.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

