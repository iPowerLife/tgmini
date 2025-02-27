"use client"

import { useState, useEffect } from "react"
import { useWebApp } from "@twa-dev/sdk/react"
import { supabase, mineCoins, getAvailableMiners, buyMiner } from "../lib/supabase"

export default function Home() {
  const [user, setUser] = useState(null)
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const webapp = useWebApp()

  useEffect(() => {
    initUser()
    loadMiners()
  }, [])

  const initUser = async () => {
    try {
      const { id: telegramId, username } = webapp.initDataUnsafe.user

      const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

      if (existingUser) {
        setUser(existingUser)
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert([{ telegram_id: telegramId, username }])
          .select()
          .single()

        setUser(newUser)
      }
    } catch (error) {
      console.error("Error initializing user:", error)
      webapp.showPopup({ message: "Ошибка инициализации пользователя" })
    } finally {
      setLoading(false)
    }
  }

  const loadMiners = async () => {
    const availableMiners = await getAvailableMiners()
    setMiners(availableMiners)
  }

  const handleMining = async () => {
    if (!user) return

    const result = await mineCoins(user.id)
    webapp.showPopup({ message: result.message })

    if (result.success) {
      setUser((prev) => ({
        ...prev,
        balance: result.balance,
      }))
    }
  }

  const handleBuyMiner = async (minerId) => {
    if (!user) return

    const result = await buyMiner(user.id, minerId)
    webapp.showPopup({ message: result.message })

    if (result.success) {
      setUser((prev) => ({
        ...prev,
        balance: result.balance,
        mining_power: result.mining_power,
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">Mining Game</div>
        <div className="text-sm">Уровень: {user?.level || 1}</div>
      </div>

      {/* Статистика */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{user?.balance?.toFixed(2) || "0.00"}</div>
          <div className="text-sm opacity-75">монет</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-75">Мощность</div>
            <div>{user?.mining_power?.toFixed(2) || "1.00"}/мин</div>
          </div>
          <div>
            <div className="opacity-75">Опыт</div>
            <div>
              {user?.experience || "0"}/{user?.next_level_exp || "100"}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <button
        onClick={handleMining}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg mb-6"
      >
        ⛏️ Майнить
      </button>

      {/* Магазин майнеров */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-lg font-bold mb-4">Магазин</div>
        <div className="grid gap-4">
          {miners.map((miner) => (
            <div key={miner.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{miner.name}</div>
                  <div className="text-sm opacity-75">+{miner.power}/мин</div>
                </div>
                <button
                  onClick={() => handleBuyMiner(miner.id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  💰 {miner.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

