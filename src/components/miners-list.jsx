"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Skeleton } from "./skeleton"

function MinerCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>
  )
}

export function MinersList({ user }) {
  const [miners, setMiners] = useState([])
  const [totalPower, setTotalPower] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMiners = async () => {
      try {
        const { data } = await supabase
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

        setMiners(data || [])
        const power = (data || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
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
    return (
      <div className="miners-container">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="miners-grid">
          <MinerCardSkeleton />
          <MinerCardSkeleton />
          <MinerCardSkeleton />
        </div>
      </div>
    )
  }

  if (!miners.length) {
    return (
      <div className="section-container empty">
        <p className="text-center text-gray-400">
          У вас пока нет майнеров
          <br />
          Купите майнеры в магазине, чтобы начать добывать монеты
        </p>
      </div>
    )
  }

  return (
    <div className="miners-container">
      <div className="text-xl font-semibold mb-6 text-center">Общая мощность: {totalPower.toFixed(3)} ⚡</div>

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

