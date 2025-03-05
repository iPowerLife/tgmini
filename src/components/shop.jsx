"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  ShoppingCart,
  Zap,
  Gauge,
  Crown,
  Sparkles,
  Rocket,
  Shield,
  Cpu,
  Layers,
  Flame,
  Bolt,
  Coins,
  Loader,
  AlertCircle,
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react"
import { supabase } from "../supabase"

// Компонент карточки майнера
const MinerCard = ({ miner, onBuy, userBalance, loading, currentQuantity, purchaseLimit, hasMinerPass }) => {
  // Проверяем, может ли пользователь купить майнер
  const canBuy = userBalance >= miner.price

  // Проверяем, не достигнут ли лимит
  const limitReached = purchaseLimit !== null && currentQuantity >= purchaseLimit && !hasMinerPass

  // Текст для кнопки при достижении лимита
  const limitText = hasMinerPass ? `${currentQuantity}` : `${currentQuantity}/${purchaseLimit}`

  return (
    <div className="bg-[#151B26] rounded-xl p-3 mb-3 shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-base mb-0.5">{miner.display_name || miner.name}</h3>
          <p className="text-xs text-gray-400">{miner.description || "Майнер для добычи криптовалюты"}</p>
        </div>
        {miner.is_new && (
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Новинка</span>
        )}
      </div>

      <div className="bg-[#0F1520] rounded-lg p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 bg-[#1F2937] rounded-lg flex items-center justify-center">
            <Cpu className="text-[#5B9DFF]" size={32} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Bolt size={14} className="text-[#5B9DFF]" />
              <span className="text-xs text-gray-400">Хешрейт:</span>
              <span className="text-xs font-medium ml-auto">{miner.mining_power}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-gray-400">Энергия:</span>
              <span className="text-xs font-medium ml-auto">{miner.energy_consumption}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={14} className="text-green-400" />
              <span className="text-xs text-gray-400">Эффект:</span>
              <span className="text-xs font-medium ml-auto">
                {miner.efficiency || Math.round((miner.mining_power / miner.energy_consumption) * 10)}%
              </span>
            </div>
            {purchaseLimit !== null && (
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-yellow-400" />
                <span className="text-xs text-gray-400">Кол-во:</span>
                <span className={`text-xs font-medium ml-auto ${limitReached ? "text-red-400" : ""}`}>{limitText}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{miner.price}</span>
          </div>
          <button
            onClick={() => onBuy(miner.id, miner.price)}
            className={`
    px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5
    transition-all duration-200 shadow-sm
    ${
      loading
        ? "bg-gray-600 text-gray-300 cursor-wait"
        : limitReached
          ? "bg-gray-700/80 text-gray-400 cursor-not-allowed"
          : canBuy
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:shadow-md hover:translate-y-[-1px]"
            : "bg-gray-700/80 text-gray-400 cursor-not-allowed"
    }
  `}
            disabled={!canBuy || loading || limitReached}
          >
            {loading ? (
              <>
                <Loader size={12} className="animate-spin" />
                <span>Покупка...</span>
              </>
            ) : limitReached ? (
              <>
                <Shield size={12} />
                <span>Лимит</span>
              </>
            ) : canBuy ? (
              <>
                <ShoppingCart size={12} />
                <span>Купить</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                <span>Недостаточно</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Обновляем компонент навигации по типам майнеров
const MinerTypesNavigation = ({ activeType, onTypeChange }) => {
  const minerTypes = [
    { id: "basic", name: "Базовый", icon: Zap, color: "blue" },
    { id: "advanced", name: "Продвинутый", icon: Gauge, color: "purple" },
    { id: "premium", name: "Премиум", icon: Crown, color: "yellow" },
  ]

  return (
    <div className="bg-[#151B26] rounded-lg p-1.5 mb-3 shadow-md">
      <div className="flex gap-1.5">
        {minerTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`
    flex items-center gap-1.5 py-1.5 px-2.5 rounded-md flex-1
    transition-all duration-200 text-xs
    ${
      isActive
        ? `bg-gradient-to-r from-[#1F2937] to-[#1A2231] text-${type.color}-400 shadow-sm border-l-2 border-${type.color}-500`
        : "text-gray-400 hover:bg-[#1A2231] hover:text-gray-300"
    }
  `}
            >
              <Icon size={14} />
              <span className="font-medium">{type.name}</span>
              {isActive && <ChevronRight size={12} className="ml-auto" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Обновляем компонент навигации по категориям
const CategoryNavigation = ({ activeCategory, onCategoryChange }) => {
  const navCategories = [
    { id: "shop", name: "Магазин", icon: ShoppingCart },
    { id: "special", name: "Специальные", icon: Sparkles },
    { id: "premium", name: "Премиум", icon: Crown },
    { id: "boosts", name: "Бусты", icon: Rocket },
  ]

  return (
    <div className="bg-[#151B26] rounded-lg p-1.5 mb-3 shadow-md">
      <div className="flex gap-1.5">
        {navCategories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
    flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2.5 rounded-md
    transition-all duration-200 text-xs
    ${
      isActive
        ? "bg-gradient-to-r from-[#1F2937] to-[#1A2231] text-white shadow-sm border-b-2 border-blue-500"
        : "text-gray-400 hover:bg-[#1A2231] hover:text-gray-300"
    }
  `}
            >
              <Icon size={14} />
              <span className="font-medium">{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// В основном компоненте Shop обновляем структуру навигации
export const Shop = ({ user, onPurchase, categories = [], models = [], hasMinerPass: initialHasMinerPass = false }) => {
  const [activeCategory, setActiveCategory] = useState("shop")
  const [activeType, setActiveType] = useState("basic")
  const [categoryMap, setCategoryMap] = useState({})
  const [filteredModels, setFilteredModels] = useState({
    basic: [],
    advanced: [],
    premium: [],
  })
  const [loading, setLoading] = useState(false)
  const [userMiners, setUserMiners] = useState([])
  const [specialItems, setSpecialItems] = useState([])
  const [userSpecialItems, setUserSpecialItems] = useState([])
  const [hasMinerPass, setHasMinerPass] = useState(initialHasMinerPass)

  // Получаем баланс пользователя
  const balance = user?.balance || 0

  // Загрузка майнеров пользователя
  useEffect(() => {
    if (!user?.id) return

    const loadUserMiners = async () => {
      try {
        const { data, error } = await supabase.from("user_miners").select("*").eq("user_id", user.id)

        if (error) throw error
        setUserMiners(data || [])
      } catch (error) {
        console.error("Error loading user miners:", error)
      }
    }

    loadUserMiners()
  }, [user?.id])

  // Загрузка специальных предметов
  useEffect(() => {
    if (!user?.id) return

    const loadSpecialItems = async () => {
      try {
        // Загружаем все специальные предметы напрямую из таблицы special_items
        const { data: items, error: itemsError } = await supabase.from("special_items").select("*").order("price")

        if (itemsError) throw itemsError
        setSpecialItems(items || [])

        // Загружаем специальные предметы пользователя
        const { data: userItems, error: userItemsError } = await supabase
          .from("user_special_items")
          .select("*")
          .eq("user_id", user.id)

        if (userItemsError) throw userItemsError
        setUserSpecialItems(userItems || [])
      } catch (error) {
        console.error("Error loading special items:", error)
      }
    }

    loadSpecialItems()
  }, [user?.id])

  // Обработчик покупки майнера
  const handleBuyMiner = async (modelId, price) => {
    try {
      setLoading(true)
      console.log("Покупка майнера:", modelId, "цена:", price)

      // Вызываем функцию покупки майнера
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        model_id_param: modelId,
        price_param: price,
        quantity_param: 1,
      })

      if (error) {
        console.error("Ошибка при вызове purchase_miner:", error)
        throw error
      }

      console.log("Результат покупки:", data)

      if (data.success) {
        // Обновляем список майнеров пользователя
        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select("*")
          .eq("user_id", user.id)

        if (!minersError) {
          setUserMiners(minersData || [])
        }

        onPurchase(data.new_balance)
        alert("Майнер успешно куплен!")
      } else {
        alert(data.error || "Ошибка при покупке")
      }
    } catch (error) {
      console.error("Error purchasing miner:", error)
      alert("Ошибка при покупке майнера: " + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  // Обновленный обработчик смены категории
  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId)
    // Сбрасываем тип майнера при переходе в другую категорию
    if (categoryId === "shop") {
      setActiveType("basic")
    }
  }, [])

  // Обновленный обработчик покупки специального предмета
  const handleBuySpecialItem = async (itemName, price) => {
    try {
      setLoading(true)
      console.log("Покупка предмета:", itemName, "цена:", price)

      if (!user?.id) {
        throw new Error("Пользователь не авторизован")
      }

      // Вызываем функцию покупки специального предмета
      const { data, error } = await supabase.rpc("purchase_special_item", {
        user_id_param: user.id,
        item_name_param: itemName,
        price_param: price,
      })

      if (error) {
        console.error("Ошибка при вызове purchase_special_item:", error)
        throw error
      }

      console.log("Результат покупки:", data)

      if (data.success) {
        // Обновляем список специальных предметов пользователя
        const { data: itemsData, error: itemsError } = await supabase
          .from("user_special_items")
          .select("*")
          .eq("user_id", user.id)

        if (!itemsError) {
          setUserSpecialItems(itemsData || [])
        }

        // Обновляем статус Miner Pass
        if (itemName === "miner_pass") {
          setHasMinerPass(true)
        }

        onPurchase(data.new_balance)
        alert("Предмет успешно куплен!")
      } else {
        alert(data.error || "Ошибка при покупке")
      }
    } catch (error) {
      console.error("Error purchasing special item:", error)
      alert("Ошибка при покупке предмета: " + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  // Обрабатываем данные категорий и моделей при их изменении
  useEffect(() => {
    // Создаем карту категорий для быстрого доступа
    const catMap = {}
    categories.forEach((cat) => {
      catMap[cat.id] = cat
    })
    setCategoryMap(catMap)

    // Определяем категории по их названиям
    const categoryTypes = {
      basic: [],
      advanced: [],
      premium: [],
    }

    // Находим ID категорий для каждого типа
    categories.forEach((category) => {
      const name = (category.name || category.display_name || "").toLowerCase()

      if (name.includes("базов") || name.includes("basic")) {
        categoryTypes.basic.push(category.id)
      } else if (name.includes("продвинут") || name.includes("advanced")) {
        categoryTypes.advanced.push(category.id)
      } else if (name.includes("премиум") || name.includes("premium")) {
        categoryTypes.premium.push(category.id)
      }
    })

    // Группируем модели по типам категорий
    const modelsByType = {
      basic: [],
      advanced: [],
      premium: [],
    }

    // Распределяем модели по типам категорий и добавляем лимиты покупки
    models.forEach((model) => {
      // Добавляем информацию о лимите покупки из категории
      const categoryId = model.category_id
      const category = catMap[categoryId]
      model.purchase_limit = category?.purchase_limit || null

      if (categoryTypes.basic.includes(model.category_id)) {
        modelsByType.basic.push(model)
      } else if (categoryTypes.advanced.includes(model.category_id)) {
        modelsByType.advanced.push(model)
      } else if (categoryTypes.premium.includes(model.category_id)) {
        modelsByType.premium.push(model)
      }
    })

    setFilteredModels(modelsByType)

    // Если нет активного типа или в активном типе нет моделей, выбираем первый непустой тип
    if (!modelsByType[activeType] || modelsByType[activeType].length === 0) {
      for (const type of ["basic", "advanced", "premium"]) {
        if (modelsByType[type] && modelsByType[type].length > 0) {
          setActiveType(type)
          break
        }
      }
    }
  }, [categories, models, activeType])

  // Описания для категорий
  const categoryDescriptions = {
    basic: "Оптимальное решение для начала майнинга",
    advanced: "Для опытных майнеров, желающих увеличить доход",
    premium: "Максимальная производительность и эффективность",
  }

  // Заголовки для категорий
  const categoryTitles = {
    basic: "Базовые майнеры",
    advanced: "Продвинутые майнеры",
    premium: "Премиум майнеры",
  }

  // Иконки для категорий
  const categoryIcons = {
    basic: Zap,
    advanced: Gauge,
    premium: Crown,
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] p-3">
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
          <span className="text-green-400 text-sm font-medium">{balance}</span>
          <span className="text-gray-400 text-xs">монет</span>
        </div>
      </div>

      {/* Основная навигация */}
      <CategoryNavigation activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Подкатегории для раздела магазина */}
      {activeCategory === "shop" && <MinerTypesNavigation activeType={activeType} onTypeChange={setActiveType} />}

      {/* Заголовок и описание категории */}
      {activeCategory === "shop" && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            {React.createElement(categoryIcons[activeType], { size: 16, className: "text-[#5B9DFF]" })}
            <h2 className="text-white text-sm font-medium">{categoryTitles[activeType]}</h2>
          </div>
          <p className="text-gray-400 text-xs">{categoryDescriptions[activeType]}</p>
        </div>
      )}

      {/* Отображаем соответствующий раздел */}
      {activeCategory === "shop" && (
        <div className="space-y-3">
          {/* Список майнеров по категориям */}
          {(activeType === "basic"
            ? filteredModels.basic
            : activeType === "advanced"
              ? filteredModels.advanced
              : filteredModels.premium
          )?.map((miner) => {
            // Находим текущее количество этого майнера у пользователя
            const userMiner = userMiners.find((um) => um.model_id === miner.id)
            const currentQuantity = userMiner ? userMiner.quantity : 0

            return (
              <MinerCard
                key={miner.id}
                miner={miner}
                onBuy={handleBuyMiner}
                userBalance={balance}
                loading={loading}
                currentQuantity={currentQuantity}
                purchaseLimit={miner.purchase_limit}
                hasMinerPass={hasMinerPass}
              />
            )
          })}

          {/* Если нет майнеров */}
          {(activeType === "basic" && (!filteredModels.basic || filteredModels.basic.length === 0)) ||
          (activeType === "advanced" && (!filteredModels.advanced || filteredModels.advanced.length === 0)) ||
          (activeType === "premium" && (!filteredModels.premium || filteredModels.premium.length === 0)) ? (
            <div className="text-center py-6 text-gray-400 text-sm">В этой категории пока нет доступных майнеров</div>
          ) : null}

          {/* Кнопка "Показать все" в конце списка майнеров */}
          {(activeType === "basic" && filteredModels.basic?.length > 0) ||
          (activeType === "advanced" && filteredModels.advanced?.length > 0) ||
          (activeType === "premium" && filteredModels.premium?.length > 0) ? (
            <div className="flex justify-center mt-2">
              <button className="flex items-center gap-1.5 text-xs text-blue-400 bg-[#151B26] py-2 px-4 rounded-lg hover:bg-[#1A2231] transition-colors">
                <Plus size={12} />
                <span>Показать все</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Раздел специальных предметов */}
      {activeCategory === "special" && (
        <>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={16} className="text-yellow-400" />
            <h2 className="text-white text-sm font-medium">Специальные предметы</h2>
          </div>
          <p className="text-gray-400 text-xs mb-3">Уникальные предметы и улучшения для вашего майнинга</p>

          {/* Здесь будет список специальных предметов */}
          <div className="text-center py-6 text-gray-400 text-sm">Специальные предметы в разработке</div>
        </>
      )}

      {/* Заглушки для других разделов */}
      {activeCategory === "premium" && (
        <div className="text-center py-6 text-gray-400 text-sm">Премиум раздел находится в разработке</div>
      )}

      {activeCategory === "boosts" && (
        <div className="text-center py-6 text-gray-400 text-sm">Раздел бустов находится в разработке</div>
      )}
    </div>
  )
}

// Экспорт по умолчанию для совместимости
export default Shop

