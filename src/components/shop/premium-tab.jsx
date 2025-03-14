"use client"

import { useState } from "react"
import { supabase } from "../../supabase"

export function PremiumTab({ user, onPurchase }) {
  const [premiumItems, setPremiumItems] = useState([
    {
      id: 1,
      name: "Miner Pass",
      description: "Премиум-статус с дополнительными возможностями",
      price: 1000,
      benefits: [
        "Доступ к эксклюзивным майнерам",
        "Бонус +20% к скорости майнинга",
        "Ежедневный бонус 50 криптовалюты",
      ],
      image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
    },
    {
      id: 2,
      name: "VIP Статус",
      description: "Элитный статус для настоящих профессионалов",
      price: 5000,
      benefits: [
        "Все преимущества Miner Pass",
        "Бонус +50% к скорости майнинга",
        "Ежедневный бонус 200 криптовалюты",
        "Приоритетная техподдержка",
      ],
      image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991117.png",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handlePurchase = async (item) => {
    if (!user || user.balance < item.price) return

    setLoading(true)
    setSelectedItem(item.id)

    try {
      // Вызываем RPC функцию для покупки премиум-статуса
      const { data, error } = await supabase.rpc("purchase_miner_pass", {
        user_id_param: user.id,
        pass_type_param: item.id === 1 ? "standard" : "vip",
      })

      if (error) throw error

      if (data && data.success) {
        // Обновляем баланс пользователя
        if (onPurchase) {
          onPurchase(data.new_balance, true)
        }

        alert(`Вы успешно приобрели ${item.name}!`)
      } else {
        alert("Не удалось совершить покупку. Попробуйте позже.")
      }
    } catch (error) {
      console.error("Ошибка при покупке премиум-статуса:", error)
      alert(`Ошибка: ${error.message || "Не удалось совершить покупку"}`)
    } finally {
      setLoading(false)
      setSelectedItem(null)
    }
  }

  return (
    <div className="space-y-4">
      {premiumItems.map((item) => (
        <div key={item.id} className="bg-[#242838] rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center mr-3">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          </div>

          <div className="bg-[#1A1F2E] p-3 rounded mb-3">
            <div className="text-sm font-semibold mb-2">Преимущества:</div>
            <ul className="text-sm text-gray-400 space-y-1">
              {item.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-2">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-bold text-blue-400">{item.price} 💎</div>
            <button
              onClick={() => handlePurchase(item)}
              disabled={loading || !user || user.balance < item.price || (user?.hasMinerPass && item.id === 1)}
              className={`px-4 py-2 rounded ${
                loading && selectedItem === item.id
                  ? "bg-gray-600 cursor-wait"
                  : user?.hasMinerPass && item.id === 1
                    ? "bg-green-600 cursor-not-allowed"
                    : user && user.balance >= item.price
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {loading && selectedItem === item.id ? (
                <span>Покупка...</span>
              ) : user?.hasMinerPass && item.id === 1 ? (
                <span>Уже активен</span>
              ) : user && user.balance < item.price ? (
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

