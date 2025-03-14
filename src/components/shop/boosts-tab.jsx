"use client"

// Заменяем весь компонент на версию с загрузкой данных из Supabase

import { useState, useEffect } from "react"
import { supabase } from "../../supabase"

export function BoostsTab({ user, onPurchase }) {
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBoost, setSelectedBoost] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  // Загружаем данные бустов из базы данных
  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        // Получаем доступные бусты
        const { data, error } = await supabase.from("boosts").select("*").order("price", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setBoosts(data)
        } else {
          // Если данных нет, используем статические данные
          setBoosts([
            {
              id: 1,
              name: "Ускоритель майнинга",
              description: "Увеличивает скорость майнинга на 50% на 24 часа",
              price: 200,
              duration: 24,
              boost_type: "mining_speed",
              boost_value: 50,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
            },
            {
              id: 2,
              name: "Энергосбережение",
              description: "Снижает потребление энергии на 30% на 12 часов",
              price: 150,
              duration: 12,
              boost_type: "energy_saving",
              boost_value: 30,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991124.png",
            },
            {
              id: 3,
              name: "Двойная награда",
              description: "Удваивает все награды за майнинг на 6 часов",
              price: 300,
              duration: 6,
              boost_type: "double_reward",
              boost_value: 100,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
            },
          ])
        }
      } catch (err) {
        console.error("Ошибка при загрузке бустов:", err)
        setError(err.message)
        // Используем статические данные при ошибке
        setBoosts([
          {
            id: 1,
            name: "Ускоритель майнинга",
            description: "Увеличивает скорость майнинга на 50% на 24 часа",
            price: 200,
            duration: 24,
            boost_type: "mining_speed",
            boost_value: 50,
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
          },
          {
            id: 2,
            name: "Энергосбережение",
            description: "Снижает потребление энергии на 30% на 12 часов",
            price: 150,
            duration: 12,
            boost_type: "energy_saving",
            boost_value: 30,
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991124.png",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBoosts()
  }, [])

  const handlePurchase = async (boost) => {
    if (!user || user.balance < boost.price) return

    setPurchaseLoading(true)
    setSelectedBoost(boost.id)

    try {
      // Вызываем RPC функцию для покупки буста
      const { data, error } = await supabase.rpc("purchase_special_item", {
        user_id_param: user.id,
        item_id_param: boost.id,
        item_type_param: "boost",
      })

      if (error) throw error

      if (data && data.success) {
        // Обновляем баланс пользователя
        if (onPurchase) {
          onPurchase(data.new_balance)
        }

        alert(`Вы успешно приобрели ${boost.name}!`)
      } else {
        alert("Не удалось совершить покупку. Попробуйте позже.")
      }
    } catch (error) {
      console.error("Ошибка при покупке буста:", error)
      alert(`Ошибка: ${error.message || "Не удалось совершить покупку"}`)
    } finally {
      setPurchaseLoading(false)
      setSelectedBoost(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && boosts.length === 0) {
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
      {boosts.length === 0 ? (
        <div className="bg-[#242838] rounded-lg p-4 text-center">
          <p className="text-gray-400">Бусты временно недоступны</p>
        </div>
      ) : (
        boosts.map((boost) => (
          <div key={boost.id} className="bg-[#242838] rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                <img
                  src={boost.image_url || "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"}
                  alt={boost.name}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h3 className="font-semibold">{boost.name}</h3>
                <p className="text-sm text-gray-400">{boost.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#1A1F2E] p-2 rounded">
                <div className="text-xs text-gray-400">Бонус:</div>
                <div className="font-semibold">+{boost.boost_value}%</div>
              </div>
              <div className="bg-[#1A1F2E] p-2 rounded">
                <div className="text-xs text-gray-400">Длительность:</div>
                <div className="font-semibold">{boost.duration} ч.</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="font-bold text-blue-400">{boost.price} 💎</div>
              <button
                onClick={() => handlePurchase(boost)}
                disabled={purchaseLoading || !user || user.balance < boost.price}
                className={`px-4 py-2 rounded ${
                  purchaseLoading && selectedBoost === boost.id
                    ? "bg-gray-600 cursor-wait"
                    : user && user.balance >= boost.price
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {purchaseLoading && selectedBoost === boost.id ? (
                  <span>Покупка...</span>
                ) : user && user.balance < boost.price ? (
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

