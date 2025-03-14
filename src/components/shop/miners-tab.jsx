"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../supabase"

export function MinersTab({ user, onPurchase }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("basic")

  // Загружаем данные майнеров из базы данных
  useEffect(() => {
    const fetchMiners = async () => {
      try {
        console.log("Загрузка майнеров из базы данных...")
        const { data, error } = await supabase
          .from("miner_models")
          .select("*")
          .order("mining_power", { ascending: true })

        if (error) {
          console.error("Ошибка при загрузке майнеров:", error)
          throw error
        }

        console.log("Полученные данные майнеров:", data)

        if (data && data.length > 0) {
          setMiners(data)
        } else {
          console.log("Нет данных о майнерах, используем статические данные")
          // Если данных нет, используем статические данные
          setMiners([
            {
              id: 1,
              name: "basic_miner_1",
              display_name: "Базовый майнер I",
              description: "Начальный майнер для новичков",
              mining_power: 10,
              energy_consumption: 5,
              price: 100,
              category: "basic",
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991109.png",
            },
            {
              id: 2,
              name: "basic_miner_2",
              display_name: "Базовый майнер II",
              description: "Улучшенная версия базового майнера",
              mining_power: 20,
              energy_consumption: 8,
              price: 250,
              category: "basic",
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991110.png",
            },
            {
              id: 3,
              name: "pro_miner_1",
              display_name: "Про майнер I",
              description: "Профессиональный майнер с высокой производительностью",
              mining_power: 50,
              energy_consumption: 15,
              price: 500,
              category: "pro",
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991111.png",
            },
            {
              id: 4,
              name: "premium_miner_1",
              display_name: "Премиум майнер I",
              description: "Элитный майнер с максимальной эффективностью",
              mining_power: 100,
              energy_consumption: 25,
              price: 1000,
              category: "premium",
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
            },
          ])
        }
      } catch (err) {
        console.error("Ошибка при загрузке майнеров:", err)
        setError(err.message)
        // Используем статические данные при ошибке
        setMiners([
          {
            id: 1,
            name: "basic_miner_1",
            display_name: "Базовый майнер I",
            description: "Начальный майнер для новичков",
            mining_power: 10,
            energy_consumption: 5,
            price: 100,
            category: "basic",
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991109.png",
          },
          {
            id: 2,
            name: "basic_miner_2",
            display_name: "Базовый майнер II",
            description: "Улучшенная версия базового майнера",
            mining_power: 20,
            energy_consumption: 8,
            price: 250,
            category: "basic",
            image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991110.png",
          },
        ])
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
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        miner_model_id_param: miner.id,
      })

      if (error) throw error

      if (data && data.success) {
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

  // Получаем цвет и стили для категории
  const getCategoryStyles = (category) => {
    switch (category) {
      case "pro":
        return {
          tab: "bg-purple-600",
          card: "bg-[#2A2442]",
          button: "bg-purple-600 hover:bg-purple-700",
          border: "border-purple-500/30",
          gradient: "from-purple-600/20 to-purple-500/20",
        }
      case "premium":
        return {
          tab: "bg-yellow-600",
          card: "bg-[#2A2824]",
          button: "bg-yellow-600 hover:bg-yellow-700",
          border: "border-yellow-500/30",
          gradient: "from-yellow-600/20 to-amber-500/20",
        }
      default: // basic
        return {
          tab: "bg-blue-600",
          card: "bg-[#242838]",
          button: "bg-blue-600 hover:bg-blue-700",
          border: "border-blue-500/30",
          gradient: "from-blue-600/20 to-blue-500/20",
        }
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

  // Фильтруем майнеры по категории
  const filteredMiners = miners.filter((miner) => miner.category === activeCategory)

  console.log("Отфильтрованные майнеры:", filteredMiners)
  console.log("Активная категория:", activeCategory)
  console.log("Все майнеры:", miners)

  return (
    <div>
      {/* Категории майнеров */}
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory("basic")}
          className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
            activeCategory === "basic" ? "bg-blue-600 text-white" : "bg-[#242838] text-gray-400"
          }`}
        >
          <span>⚡</span>
          <span>Basic</span>
        </button>
        <button
          onClick={() => setActiveCategory("pro")}
          className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
            activeCategory === "pro" ? "bg-purple-600 text-white" : "bg-[#242838] text-gray-400"
          }`}
        >
          <span>🔮</span>
          <span>Pro</span>
        </button>
        <button
          onClick={() => setActiveCategory("premium")}
          className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
            activeCategory === "premium" ? "bg-yellow-600 text-white" : "bg-[#242838] text-gray-400"
          }`}
        >
          <span>👑</span>
          <span>Premium</span>
        </button>
      </div>

      {/* Информация о категории */}
      <div className="mb-4">
        {activeCategory === "basic" && (
          <div className="flex justify-between items-center text-sm">
            <div className="text-blue-400">Basic майнеры</div>
            <div className="text-gray-400">
              У вас: {user?.miners?.filter((m) => m.model.category === "basic").length || 0} (без лимита)
            </div>
          </div>
        )}
        {activeCategory === "pro" && (
          <div className="flex justify-between items-center text-sm">
            <div className="text-purple-400">Pro майнеры</div>
            <div className="text-gray-400">
              У вас: {user?.miners?.filter((m) => m.model.category === "pro").length || 0} (без лимита)
            </div>
          </div>
        )}
        {activeCategory === "premium" && (
          <div className="flex justify-between items-center text-sm">
            <div className="text-yellow-400">Premium майнеры</div>
            <div className="text-gray-400">
              У вас: {user?.miners?.filter((m) => m.model.category === "premium").length || 0} (без лимита)
            </div>
          </div>
        )}
      </div>

      {/* Список майнеров */}
      <div className="space-y-4">
        {filteredMiners.length > 0 ? (
          filteredMiners.map((miner) => {
            const styles = getCategoryStyles(miner.category)

            return (
              <div key={miner.id} className={`${styles.card} rounded-lg p-4 border border-${styles.border}`}>
                <div className="flex items-start space-x-4">
                  {/* Изображение майнера */}
                  <div className={`w-24 h-24 rounded-lg bg-gradient-to-r ${styles.gradient} p-1`}>
                    <img
                      src={miner.image_url || `/miners/${miner.category}-miner.png`}
                      alt={miner.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Информация о майнере */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{miner.display_name || miner.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{miner.description}</p>

                    {/* Характеристики */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#1A1F2E] p-2 rounded">
                        <div className="text-xs text-gray-400">Хешрейт:</div>
                        <div className="font-semibold">{miner.mining_power} h/s</div>
                      </div>
                      <div className="bg-[#1A1F2E] p-2 rounded">
                        <div className="text-xs text-gray-400">Энергия:</div>
                        <div className="font-semibold">{miner.energy_consumption} kw/h</div>
                      </div>
                      <div className="bg-[#1A1F2E] p-2 rounded">
                        <div className="text-xs text-gray-400">Эффективность:</div>
                        <div className="font-semibold">
                          {(miner.mining_power / miner.energy_consumption).toFixed(1)} h/w
                        </div>
                      </div>
                    </div>

                    {/* Кнопка покупки */}
                    <button
                      onClick={() => handlePurchase(miner)}
                      disabled={purchaseLoading || !user || user.balance < miner.price}
                      className={`w-full py-2 rounded-lg text-center ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {purchaseLoading && selectedMiner === miner.id ? "Покупка..." : `Купить ${miner.price} монет`}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-[#242838] rounded-lg p-4 text-center">
            <p className="text-gray-400">В этой категории пока нет доступных майнеров</p>
          </div>
        )}
      </div>
    </div>
  )
}

