"use client"

import { useState } from "react"
import { supabase } from "../../supabase"

export function MinersTab({ user, onPurchase }) {
  const [miners, setMiners] = useState([
    {
      id: 1,
      name: "Базовый майнер",
      description: "Начальный майнер для новичков",
      price: 100,
      mining_power: 1,
      energy_consumption: 5,
      image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991109.png",
    },
    {
      id: 2,
      name: "Продвинутый майнер",
      description: "Улучшенная версия с большей мощностью",
      price: 500,
      mining_power: 5,
      energy_consumption: 20,
      image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991117.png",
    },
    {
      id: 3,
      name: "Профессиональный майнер",
      description: "Для серьезного майнинга",
      price: 2000,
      mining_power: 25,
      energy_consumption: 80,
      image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991107.png",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [selectedMiner, setSelectedMiner] = useState(null)

  const handlePurchase = async (miner) => {
    if (!user || user.balance < miner.price) return

    setLoading(true)
    setSelectedMiner(miner.id)

    try {
      // Вызываем RPC функцию для покупки майнера
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        miner_model_id_param: miner.id,
      })

      if (error) throw error

      if (data && data.success) {
        // Обновляем баланс пользователя
        if (onPurchase) {
          onPurchase(data.new_balance)
        }

        alert(`Вы успешно приобрели ${miner.name}!`)
      } else {
        alert("Не удалось совершить покупку. Попробуйте позже.")
      }
    } catch (error) {
      console.error("Ошибка при покупке майнера:", error)
      alert(`Ошибка: ${error.message || "Не удалось совершить покупку"}`)
    } finally {
      setLoading(false)
      setSelectedMiner(null)
    }
  }

  return (
    <div className="space-y-4">
      {miners.map((miner) => (
        <div key={miner.id} className="bg-[#242838] rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
              <img src={miner.image_url || "/placeholder.svg"} alt={miner.name} className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold">{miner.name}</h3>
              <p className="text-sm text-gray-400">{miner.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#1A1F2E] p-2 rounded">
              <div className="text-xs text-gray-400">Мощность:</div>
              <div className="font-semibold">{miner.mining_power} h/s</div>
            </div>
            <div className="bg-[#1A1F2E] p-2 rounded">
              <div className="text-xs text-gray-400">Энергия:</div>
              <div className="font-semibold">{miner.energy_consumption} ⚡</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-bold text-blue-400">{miner.price} 💎</div>
            <button
              onClick={() => handlePurchase(miner)}
              disabled={loading || !user || user.balance < miner.price}
              className={`px-4 py-2 rounded ${
                loading && selectedMiner === miner.id
                  ? "bg-gray-600 cursor-wait"
                  : user && user.balance >= miner.price
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {loading && selectedMiner === miner.id ? (
                <span>Покупка...</span>
              ) : user && user.balance < miner.price ? (
                <span>Недостаточно средств</span>
              ) : (
                <span>Купить</span>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

