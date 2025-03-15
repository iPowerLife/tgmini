"use client"

import { useState, useEffect } from "react"
import { MinersTab } from "../components/shop/miners-tab"
import { SpecialItemsTab } from "../components/shop/special-items-tab"
import { supabase } from "../supabase"

const ShopPage = ({ user, onBalanceUpdate }) => {
  const [activeTab, setActiveTab] = useState("miners")
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [hasMinerPass, setHasMinerPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загружаем данные о категориях и моделях майнеров
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Проверяем наличие Miner Pass у пользователя
        if (user?.id) {
          const { data: passData, error: passError } = await supabase.rpc("has_miner_pass", {
            user_id_param: user.id,
          })

          if (!passError && passData !== null) {
            setHasMinerPass(passData)
          }
        }

        // Загружаем категории майнеров
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("miner_categories")
          .select("*")
          .order("id", { ascending: true })

        if (categoriesError) throw categoriesError

        // Загружаем модели майнеров
        const { data: modelsData, error: modelsError } = await supabase
          .from("miner_models")
          .select("*")
          .order("mining_power", { ascending: true })

        if (modelsError) throw modelsError

        // Если нет данных, используем статические данные
        if (!categoriesData || categoriesData.length === 0) {
          setCategories([
            { id: 1, name: "basic", display_name: "Базовые", purchase_limit: 10 },
            { id: 2, name: "advanced", display_name: "Продвинутые", purchase_limit: 5 },
            { id: 3, name: "premium", display_name: "Премиум", purchase_limit: 3 },
          ])
        } else {
          setCategories(categoriesData)
        }

        // Если нет данных о моделях, используем статические данные
        if (!modelsData || modelsData.length === 0) {
          setModels([
            {
              id: 1,
              name: "basic_miner_1",
              display_name: "Базовый майнер I",
              description: "Начальный майнер для новичков",
              mining_power: 10,
              energy_consumption: 5,
              price: 100,
              category_id: 1,
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
              category_id: 1,
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
              category_id: 2,
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
              category_id: 3,
              image_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
            },
          ])
        } else {
          setModels(modelsData)
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Обработчик покупки
  const handlePurchase = (newBalance) => {
    if (onBalanceUpdate) {
      onBalanceUpdate(newBalance)
    }
  }

  // Обработчик покупки Mining Pass
  const handleMinerPassPurchase = (newBalance) => {
    if (onBalanceUpdate) {
      onBalanceUpdate(newBalance, true)
    }
    setHasMinerPass(true)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Баланс пользователя в верхнем правом углу */}
      <div className="fixed top-16 right-4 z-10">
        <div className="bg-[#242838]/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-gray-700/50 flex items-center gap-2">
          <span className="text-yellow-400">💎</span>
          <span className="text-white font-medium">{user?.balance || 0}</span>
        </div>
      </div>

      {/* Вкладки магазина */}
      <div className="flex mb-4 bg-[#242838]/80 backdrop-blur-sm rounded-xl overflow-hidden">
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === "miners" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-[#1A1F2E]"
          }`}
          onClick={() => setActiveTab("miners")}
        >
          Майнеры
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === "special" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-[#1A1F2E]"
          }`}
          onClick={() => setActiveTab("special")}
        >
          Особые предметы
        </button>
      </div>

      {/* Содержимое вкладок */}
      {activeTab === "miners" ? (
        <MinersTab
          user={user}
          onPurchase={handlePurchase}
          categories={categories}
          models={models}
          hasMinerPass={hasMinerPass}
        />
      ) : (
        <SpecialItemsTab
          user={user}
          onPurchase={handlePurchase}
          onMinerPassPurchase={handleMinerPassPurchase}
          hasMinerPass={hasMinerPass}
        />
      )}

      {/* Предупреждение внизу страницы */}
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-200 mb-2">
          <p>⚠️ Внимание! Это тестовая версия игры. Все данные могут быть сброшены в любой момент.</p>
        </div>
      </div>
    </div>
  )
}

export default ShopPage

