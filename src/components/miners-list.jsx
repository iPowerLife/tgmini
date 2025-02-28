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

        // Подсчитываем общую мощность
        const power = data.reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
        setTotalPower(power)
      } catch (error) {
        console.error("Error loading miners:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMiners()
  }, [user.id])

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

      <style jsx>{`
        .miners-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .total-power {
          font-size: 1.2em;
          color: #4ade80;
          text-align: center;
          margin-bottom: 20px;
        }

        .miners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .miner-card {
          background: rgba(30, 41, 59, 0.7);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .miner-card h3 {
          margin: 0 0 10px 0;
          color: #f8fafc;
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 0.9em;
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}

