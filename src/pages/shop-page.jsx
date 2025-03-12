"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { ShoppingCart, Coins } from "lucide-react"
import { CategoryNavigation } from "../components/shop/category-navigation"
import { MinersTab } from "../components/shop/miners-tab"
import { SpecialTab } from "../components/shop/special-tab"
import { PremiumTab } from "../components/shop/premium-tab"
import { BoostsTab } from "../components/shop/boosts-tab"
import { WarningMessage } from "../components/shop/warning-message"

const ShopPage = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState("shop")
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [userMiners, setUserMiners] = useState([])
  const [hasMinerPass, setHasMinerPass] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updateCounter, setUpdateCounter] = useState(0)

  // Обновленный обработчик смены категории с принудительным обновлением
  const handleCategoryChange = (categoryId) => {
    console.log("Changing category to:", categoryId, "from:", activeCategory)
    setActiveCategory(categoryId)
    setUpdateCounter((prev) => prev + 1)
  }

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Загружаем категории майнеров
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("miner_categories")
          .select("*")
          .order("id")

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])

        // Загружаем модели майнеров
        const { data: modelsData, error: modelsError } = await supabase
          .from("miner_models")
          .select("*")
          .order("mining_power")

        if (modelsError) throw modelsError
        setModels(modelsData || [])

        // Загружаем майнеры пользователя
        const { data: userMinersData, error: userMinersError } = await supabase
          .from("user_miners")
          .select("*")
          .eq("user_id", user.id)

        if (userMinersError) throw userMinersError
        setUserMiners(userMinersData || [])

        // Проверяем наличие Miner Pass
        setHasMinerPass(user.has_miner_pass || false)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading shop data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Обработчик успешной покупки
  const handlePurchase = (newBalance) => {
    // Обновляем баланс пользователя
    if (user) {
      user.balance = newBalance
    }

    // Перезагружаем данные о майнерах пользователя
    const fetchUserMiners = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase.from("user_miners").select("*").eq("user_id", user.id)

        if (error) throw error
        setUserMiners(data || [])
      } catch (error) {
        console.error("Error reloading user miners:", error)
      }
    }

    fetchUserMiners()
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen p-3 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3">
      {/* Верхняя панель с балансом */}
      <div className="bg-[#151B26] rounded-lg p-3 mb-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1F2937] flex items-center justify-center">
            <ShoppingCart className="text-[#5B9DFF]" size={16} />
          </div>
          <span className="text-white text-sm font-medium">Магазин</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1F2937] py-1.5 px-3 rounded-lg">
          <Coins size={14} className="text-green-400" />
          <span className="text-green-400 text-sm font-medium">{Number(user?.balance || 0).toFixed(2)}</span>
          <span className="text-gray-400 text-xs">монет</span>
        </div>
      </div>

      {/* Основная навигация */}
      <CategoryNavigation
        key={`nav-${updateCounter}`}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Отображаем соответствующую вкладку */}
      {activeCategory === "shop" && (
        <MinersTab
          user={user}
          onPurchase={handlePurchase}
          categories={categories}
          models={models}
          hasMinerPass={hasMinerPass}
          userMiners={userMiners}
        />
      )}

      {activeCategory === "special" && (
        <SpecialTab user={user} onPurchase={handlePurchase} hasMinerPass={hasMinerPass} />
      )}

      {activeCategory === "premium" && <PremiumTab />}

      {activeCategory === "boosts" && <BoostsTab />}

      {/* Предупреждение внизу страницы */}
      <WarningMessage />
    </div>
  )
}

export default ShopPage

