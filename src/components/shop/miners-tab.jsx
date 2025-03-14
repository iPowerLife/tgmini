"use client"

// Заменяем весь компонент на версию с загрузкой данных из Supabase

import { useState, useEffect } from "react"
import { supabase } from "../../supabase"
import { createMockMiners } from "../../utils/mock-data"

export function MinersTab({ user, onPurchase }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  // Загружаем данные майнеров из базы данных
  useEffect(() => {
    const fetchMiners = async () => {
      try {
        // Получаем доступные модели майнеров
        const { data, error } = await supabase
          .from("miner_models")
          .select("*")
          .order("mining_power", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setMiners(data)
        } else {
          // Если данных нет, используем моковые данные
          setMiners(createMockMiners().map((m) => m.model))
        }
      } catch (err) {
        console.error("Ошибка при загрузке майнеров:", err)
        setError(err.message)
        // Используем моковые данные при ошибке
        setMiners(createMockMiners().map((m) => m.model))
      } finally {
        setLoading(false)
      }
    }

    fetchMiners()
  }, [])

  const handlePurchase = async (miner) => {
    if (!user || user.balance < miner.price) return

    setPurchaseLoading(true)
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

        alert(`Вы успешно приобрели ${miner.display_name || miner.name}!`)
      } else {
        alert("Не удалось совершить покупку. Попробуйте позже.")
      }
    } catch (error) {
      console.error("Ошибка при покупке майнера:", error)
      alert(`Ошибка: ${error.message || "Не удалось совершить покупку"}`)
    } finally {
      setPurchaseLoading(false)
      setSelectedMiner(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && miners.length === 0) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-white">Ошибка загрузки данных: {error}</p>
        <button
          className="mt-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {miners.length === 0 ? (
        <div className="bg-[#242838] rounded-lg p-4 text-center">
          <p className="text-gray-400">Майнеры временно недоступны</p>
        </div>
      ) : (
        miners.map((miner) => (
          <div key={miner.id} className="bg-[#242838] rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <img
                  src={miner.image_url || "https://cdn-icons-png.flaticon.com/512/2991/2991109.png"}
                  alt={miner.display_name || miner.name}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h3 className="font-semibold">{miner.display_name || miner.name}</h3>
                <p className="text-sm text-gray-400">{miner.description || "Майнер для добычи криптовалюты"}</p>
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
                disabled={purchaseLoading || !user || user.balance < miner.price}
                className={`px-4 py-2 rounded ${
                  purchaseLoading && selectedMiner === miner.id
                    ? "bg-gray-600 cursor-wait"
                    : user && user.balance >= miner.price
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {purchaseLoading && selectedMiner === miner.id ? (
                  <span>Покупка...</span>
                ) : user && user.balance < miner.price ? (
                  <span>Недостаточно средств</span>
                ) : (
                  <span>Купить</span>
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

