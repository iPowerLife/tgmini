"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../supabase"

export function SpecialTab({ user, onPurchase }) {
  const [specialItems, setSpecialItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  // Загружаем данные особых предметов из базы данных
  useEffect(() => {
    const fetchSpecialItems = async () => {
      try {
        // Получаем доступные особые предметы
        const { data, error } = await supabase.from("special_items").select("*").order("price", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setSpecialItems(data)
        } else {
          // Если данных нет, используем статические данные
          setSpecialItems([
            {
              id: 1,
              name: "Энергетический блок",
              description: "Дает дополнительные 100 единиц энергии",
              price: 50,
              item_type: "energy",
              value: 100,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
            },
            {
              id: 2,
              name: "Набор инструментов",
              description: "Повышает эффективность всех майнеров на 10% навсегда",
              price: 500,
              item_type: "tool",
              value: 10,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991102.png",
            },
            {
              id: 3,
              name: "Мгновенная награда",
              description: "Мгновенно получите 200 криптовалюты",
              price: 180,
              item_type: "instant_reward",
              value: 200,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991103.png",
            },
          ])
        }
      } catch (err) {
        console.error("Ошибка при загрузке особых предметов:", err)
        setError(err.message)
        // Используем статические данные при ошибке
        setSpecialItems([
          {
            id: 1,
            name: "Энергетический блок",
            description: "Дает дополнительные 100 единиц энергии",
            price: 50,
            item_type: "energy",
            value: 100,
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
          },
          {
            id: 2,
            name: "Набор инструментов",
            description: "Повышает эффективность всех майнеров на 10% навсегда",
            price: 500,
            item_type: "tool",
            value: 10,
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991102.png",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialItems()
  }, [])

  const handlePurchase = async (item) => {
    if (!user || user.balance < item.price) return

    setPurchaseLoading(true)
    setSelectedItem(item.id)

    try {
      // Вызываем RPC функцию для покупки особого предмета
      const { data, error } = await supabase.rpc("purchase_special_item", {
        user_id_param: user.id,
        item_id_param: item.id,
        item_type_param: "special",
      })

      if (error) throw error

      if (data && data.success) {
        // Обновляем баланс пользователя
        if (onPurchase) {
          onPurchase(data.new_balance)
        }

        alert(`Вы успешно приобрели ${item.name}!`)
      } else {
        alert("Не удалось совершить покупку. Попробуйте позже.")
      }
    } catch (error) {
      console.error("Ошибка при покупке предмета:", error)
      alert(`Ошибка: ${error.message || "Не удалось совершить покупку"}`)
    } finally {
      setPurchaseLoading(false)
      setSelectedItem(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && specialItems.length === 0) {
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
      {specialItems.length === 0 ? (
        <div className="bg-[#242838] rounded-lg p-4 text-center">
          <p className="text-gray-400">Особые предметы временно недоступны</p>
        </div>
      ) : (
        specialItems.map((item) => (
          <div key={item.id} className="bg-[#242838] rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                <img
                  src={item.image_url || "https://cdn-icons-png.flaticon.com/512/2991/2991148.png"}
                  alt={item.name}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </div>

            <div className="bg-[#1A1F2E] p-2 rounded mb-3">
              <div className="text-xs text-gray-400">Эффект:</div>
              <div className="font-semibold">
                {item.item_type === "energy" && `+${item.value} энергии`}
                {item.item_type === "tool" && `+${item.value}% эффективности`}
                {item.item_type === "instant_reward" && `+${item.value} криптовалюты`}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="font-bold text-blue-400">{item.price} 💎</div>
              <button
                onClick={() => handlePurchase(item)}
                disabled={purchaseLoading || !user || user.balance < item.price}
                className={`px-4 py-2 rounded ${
                  purchaseLoading && selectedItem === item.id
                    ? "bg-gray-600 cursor-wait"
                    : user && user.balance >= item.price
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {purchaseLoading && selectedItem === item.id ? (
                  <span>Покупка...</span>
                ) : user && user.balance < item.price ? (
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

