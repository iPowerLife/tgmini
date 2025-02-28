"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersList({ user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPower, setTotalPower] = useState(0)

  useEffect(() => {
    const loadMiners = async () => {
      try {
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
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadMiners()
    }
  }, [user?.id])

  if (loading) {
    return <div>Загрузка майнеров...</div>
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

