"use client"

import React, { useRef, useEffect } from "react"
import { useState, useCallback } from "react"
import {
  ShoppingCart,
  Zap,
  Gauge,
  Crown,
  Sparkles,
  Rocket,
  Shield,
  Gem,
  Droplet,
  Coins,
  Loader,
  ChevronRight,
  Lock,
  Bell,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "../supabase"
// Добавим импорт OptimizedImage в начало файла
import { OptimizedImage } from "./optimized-image"

// Add this component at the top level of the file, after imports
const WarningMessage = () => (
  <div className="mt-3 bg-yellow-950/50 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
    <div>
      <div className="text-yellow-500 text-sm font-medium mb-0.5">Важное уведомление</div>
      <div className="text-yellow-500/80 text-xs">
        Все покупки являются окончательными. Пожалуйста, внимательно проверяйте выбранные товары перед покупкой.
      </div>
    </div>
  </div>
)

// Обновляем компонент карточки майнера с новым дизайном
const MinerCard = ({ miner, onBuy, userBalance, loading, currentQuantity, purchaseLimit, hasMinerPass, minerType }) => {
  // ... остальные функции и проверки остаются без изменений ...

  // Проверяем, может ли пользователь купить майнер
  const canBuy = userBalance >= miner.price

  // Проверяем, не достигнут ли лимит
  const limitReached = purchaseLimit !== null && currentQuantity >= purchaseLimit && !hasMinerPass

  // Function to get miner image URL with better fallback handling
  const getMinerImageUrl = (model) => {
    if (model.image_url) {
      return model.image_url
    }
    return `/images/miners/default-${minerType}.png`
  }

  // Цветовые схемы для разных типов майнеров
  const colorSchemes = {
    basic: {
      border: "#3b82f6",
      button: "from-blue-500 to-blue-600",
      hover: "hover:from-blue-600 hover:to-blue-700",
      borderGlow: "0 0 10px rgba(59, 130, 246, 0.5)",
    },
    advanced: {
      border: "#8b5cf6",
      button: "from-purple-500 to-purple-600",
      hover: "hover:from-purple-600 hover:to-purple-700",
      borderGlow: "0 0 10px rgba(139, 92, 246, 0.5)",
    },
    premium: {
      border: "#eab308",
      button: "from-yellow-500 to-yellow-600",
      hover: "hover:from-yellow-600 hover:to-yellow-700",
      borderGlow: "0 0 10px rgba(234, 179, 8, 0.5)",
    },
  }

  const colorScheme = colorSchemes[minerType] || colorSchemes.basic

  return (
    <div
      className="rounded-xl p-3 mb-3"
      style={{
        background: `linear-gradient(to bottom right, ${colorScheme.border}15, #0B1622 70%)`,
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`,
      }}
    >
      {/* Верхняя часть с названием и описанием */}
      <div className="mb-2">
        <h3 className="text-white text-base font-medium leading-tight">{miner.display_name || miner.name}</h3>
        <p className="text-sm text-gray-400">{miner.description || "Компактный майнер для начинающих"}</p>
      </div>

      {/* Основной контент */}
      <div className="flex gap-3">
        {/* Изображение майнера - увеличенный размер и более яркая обводка */}
        <div
          className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center relative shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
            padding: "3px",
            border: `2px solid ${colorScheme.border}80`,
            boxShadow: colorScheme.borderGlow,
          }}
        >
          <OptimizedImage
            src={getMinerImageUrl(miner)}
            alt={miner.display_name}
            className="w-full h-full rounded-lg"
            fallbackSrc={`/images/miners/default-${minerType}.png`}
            style={{ background: "#0B1622" }}
            objectFit="contain"
            priority={true} // Always set priority to true for shop images
            loading="eager" // Use eager loading for shop images
          />
        </div>

        {/* Характеристики и кнопка */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Характеристики - уменьшенные отступы */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-sm whitespace-nowrap">Хешрейт:</span>
              <span className="text-white text-sm">{miner.mining_power} h/s</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-sm whitespace-nowrap">Энергия:</span>
              <span className="text-white text-sm">{miner.energy_consumption} kw/h</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-sm whitespace-nowrap">Эффективность:</span>
              <span className="text-white text-sm">
                {(miner.mining_power / miner.energy_consumption).toFixed(1)} h/w
              </span>
            </div>
          </div>

          {/* Кнопка покупки - более широкая */}
          <div className="mt-2">
            <button
              onClick={() => onBuy(miner.id, miner.price)}
              disabled={!canBuy || loading || limitReached}
              className={`
                w-full py-1.5 px-4 rounded-lg text-center text-sm
                transition-all duration-300 transform
                ${
                  loading
                    ? "bg-gray-600 text-gray-300 cursor-wait"
                    : limitReached
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : canBuy
                        ? `bg-gradient-to-r ${colorScheme.button} ${colorScheme.hover} text-white hover:shadow-lg hover:-translate-y-0.5`
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }
              `}
              style={{
                fontSize: "0.8125rem",
                letterSpacing: "0.01em",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader size={12} className="animate-spin" />
                    <span>Покупка...</span>
                  </>
                ) : (
                  <>
                    <span>Купить</span>
                    <span>{miner.price} монет</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Обновляем компонент навигации по типам майнеров с более короткими названиями
const MinerTypesNavigation = ({ activeType, onTypeChange }) => {
  const minerTypes = [
    {
      id: "basic",
      name: "Basic",
      icon: Zap,
      color: "blue",
      gradient: "from-blue-600/20 to-blue-500/5",
      activeGradient: "from-blue-600/30 to-blue-500/10",
      border: "border-blue-500",
    },
    {
      id: "advanced",
      name: "Pro",
      icon: Gauge,
      color: "purple",
      gradient: "from-purple-600/20 to-purple-500/5",
      activeGradient: "from-purple-600/30 to-purple-500/10",
      border: "border-purple-500",
    },
    {
      id: "premium",
      name: "Premium",
      icon: Crown,
      color: "yellow",
      gradient: "from-yellow-600/20 to-yellow-500/5",
      activeGradient: "from-yellow-600/30 to-yellow-500/10",
      border: "border-yellow-500",
    },
  ]

  // Обработчик клика с принудительным обновлением
  const handleTypeClick = (typeId) => {
    console.log("Clicked on type:", typeId)
    onTypeChange(typeId)
  }

  return (
    <div className="bg-[#151B26] rounded-lg p-1.5 mb-3 shadow-md">
      <div className="flex gap-1.5">
        {minerTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.id

          return (
            <button
              key={type.id}
              onClick={() => handleTypeClick(type.id)}
              className={`
                flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2.5 rounded-md
                transition-all duration-200 text-xs relative
                ${
                  isActive
                    ? `bg-gradient-to-br ${type.activeGradient} text-${type.color}-400 shadow-sm border-b-2 ${type.border}`
                    : `hover:bg-gradient-to-br ${type.gradient} text-gray-400 hover:text-${type.color}-400`
                }
              `}
              style={{
                pointerEvents: "auto",
                position: "relative",
                zIndex: 10,
              }}
            >
              {isActive && <span className="absolute inset-0 opacity-10 bg-pattern-dots" style={{ zIndex: 1 }} />}
              <div className="relative z-20 flex items-center justify-center gap-1.5">
                <Icon size={14} className={isActive ? `text-${type.color}-400` : ""} />
                <span className="font-medium">{type.name}</span>
                {isActive && <ChevronRight size={12} className="ml-1.5" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Обновляем компонент навигации по категориям - исправляем проблему с кликабельностью
const CategoryNavigation = ({ activeCategory, onCategoryChange }) => {
  // Создаем ref для отслеживания предыдущего активного состояния
  const prevCategoryRef = useRef(activeCategory)

  // Обновляем ref при изменении активной категории
  useEffect(() => {
    prevCategoryRef.current = activeCategory
  }, [activeCategory])

  const navCategories = [
    {
      id: "shop",
      name: "Маркет",
      icon: ShoppingCart,
      color: "blue",
      gradient: "from-blue-600/20 to-blue-500/5",
      activeGradient: "from-blue-600/30 to-blue-500/10",
      border: "border-blue-500",
    },
    {
      id: "special",
      name: "Спец",
      icon: Sparkles,
      color: "yellow",
      gradient: "from-yellow-600/20 to-yellow-500/5",
      activeGradient: "from-yellow-600/30 to-yellow-500/10",
      border: "border-yellow-500",
    },
    {
      id: "premium",
      name: "VIP",
      icon: Crown,
      color: "purple",
      gradient: "from-purple-600/20 to-purple-500/5",
      activeGradient: "from-purple-600/30 to-purple-500/10",
      border: "border-purple-500",
    },
    {
      id: "boosts",
      name: "Буст",
      icon: Rocket,
      color: "green",
      gradient: "from-green-600/20 to-green-500/5",
      activeGradient: "from-green-600/30 to-green-500/10",
      border: "border-green-500",
    },
  ]

  // Обработчик клика с принудительным обновлением
  const handleCategoryClick = (categoryId) => {
    console.log("Clicked on category:", categoryId)
    // Всегда вызываем обработчик, даже если категория та же самая
    onCategoryChange(categoryId)
  }

  return (
    <div className="bg-[#151B26] rounded-lg p-1.5 mb-3 shadow-md">
      <div className="flex gap-1.5">
        {navCategories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2.5 rounded-md
                transition-all duration-200 text-xs relative
                ${
                  isActive
                    ? `bg-gradient-to-br ${category.activeGradient} text-${category.color}-400 shadow-sm border-b-2 ${category.border}`
                    : `hover:bg-gradient-to-br ${category.gradient} text-gray-400 hover:text-${category.color}-400`
                }
              `}
              style={{
                pointerEvents: "auto",
                position: "relative",
                zIndex: 10,
              }}
            >
              {isActive && <span className="absolute inset-0 opacity-10 bg-pattern-dots" style={{ zIndex: 1 }} />}
              <div className="relative z-20 flex items-center justify-center gap-1.5">
                <Icon size={14} className={isActive ? `text-${category.color}-400` : ""} />
                <span className="font-medium">{category.name}</span>
              </div>
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

  // Счетчик для принудительного обновления компонента
  const [updateCounter, setUpdateCounter] = useState(0)

  // Получаем баланс пользователя
  const balance = user?.balance || 0

  // Обновленный обработчик смены категории с принудительным обновлением
  const handleCategoryChange = useCallback(
    (categoryId) => {
      console.log("Changing category to:", categoryId, "from:", activeCategory)

      // Устанавливаем новую активную категорию
      setActiveCategory(categoryId)

      // Принудительно обновляем компонент
      setUpdateCounter((prev) => prev + 1)

      // Сбрасываем тип майнера при переходе в магазин
      if (categoryId === "shop") {
        setActiveType("basic")
      }
    },
    [activeCategory],
  )

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

        // Обновляем локальное состояние пользователя
        if (user) {
          user.balance = data.new_balance
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

        // Обновляем локальное состояние пользователя
        if (user) {
          user.balance = data.new_balance
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
    basic: "Basic майнеры",
    advanced: "Pro майнеры",
    premium: "Premium майнеры",
  }

  // Иконки для категорий
  const categoryIcons = {
    basic: Zap,
    advanced: Gauge,
    premium: Crown,
  }

  // Добавляем ключ updateCounter для принудительного обновления
  console.log("Rendering Shop with activeCategory:", activeCategory, "updateCounter:", updateCounter)

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
          <span className="text-green-400 text-sm font-medium">{Number(user?.balance || balance).toFixed(2)}</span>
          <span className="text-gray-400 text-xs">монет</span>
        </div>
      </div>

      {/* Основная навигация - с исправленной кликабельностью */}
      <CategoryNavigation
        key={`nav-${updateCounter}`}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Подкатегории для раздела магазина */}
      {activeCategory === "shop" && <MinerTypesNavigation activeType={activeType} onTypeChange={setActiveType} />}

      {/* Заголовок и описание категории с информацией о доступном количестве */}
      {activeCategory === "shop" && (
        <div className="mb-3 h-14">
          <div className="flex items-center gap-1.5 mb-0.5">
            {React.createElement(categoryIcons[activeType], { size: 16, className: "text-[#5B9DFF]" })}
            <h2 className="text-white text-sm font-medium">{categoryTitles[activeType]}</h2>

            {/* Заменяем информацию о доступном количестве на информацию о лимитах */}
            {activeType && filteredModels[activeType] && (
              <span className="text-xs text-gray-400 ml-auto">
                {(() => {
                  // Находим все майнеры пользователя этой категории
                  const categoryIds = categories
                    .filter((cat) => {
                      const name = (cat.name || cat.display_name || "").toLowerCase()
                      if (activeType === "basic") return name.includes("базов") || name.includes("basic")
                      if (activeType === "advanced") return name.includes("продвинут") || name.includes("advanced")
                      if (activeType === "premium") return name.includes("премиум") || name.includes("premium")
                      return false
                    })
                    .map((cat) => cat.id)

                  // Считаем количество майнеров у пользователя в этой категории
                  const userMinersInCategory = userMiners.filter((um) => {
                    const model = models.find((m) => m.id === um.model_id)
                    return model && categoryIds.includes(model.category_id)
                  })

                  const totalUserMiners = userMinersInCategory.reduce((sum, um) => sum + (um.quantity || 0), 0)

                  // Находим лимит для этой категории
                  const categoryLimit =
                    categories.find((cat) => {
                      const name = (cat.name || cat.display_name || "").toLowerCase()
                      if (activeType === "basic") return name.includes("базов") || name.includes("basic")
                      if (activeType === "advanced") return name.includes("продвинут") || name.includes("advanced")
                      if (activeType === "premium") return name.includes("премиум") || name.includes("premium")
                      return false
                    })?.purchase_limit || 0

                  // Если у пользователя есть Mining Pass, показываем только текущее количество
                  if (hasMinerPass) {
                    return `У вас: ${totalUserMiners} (без лимита)`
                  }

                  // Иначе показываем текущее количество и лимит
                  const remaining = Math.max(0, categoryLimit - totalUserMiners)
                  return `У вас: ${totalUserMiners} / ${categoryLimit} (доступно: ${remaining})`
                })()}
              </span>
            )}
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
          ) // Исправлено: добавлен массив для премиум майнеров
            ?.map((miner) => {
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
                  minerType={activeType} // Передаем активный тип майнера
                />
              )
            })}

          {/* Если нет майнеров */}
          {(activeType === "basic" && (!filteredModels.basic || filteredModels.basic.length === 0)) ||
          (activeType === "advanced" && (!filteredModels.advanced || filteredModels.advanced.length === 0)) ||
          (activeType === "premium" && (!filteredModels.premium || filteredModels.premium.length === 0)) ? (
            <div className="text-center py-6 text-gray-400 text-sm">В этой категории пока нет доступных майнеров</div>
          ) : null}
          <WarningMessage />
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

          {/* Плашка со спецпредметами */}
          <div className="bg-[#151B26] rounded-xl p-3 mb-3 shadow-md relative overflow-hidden">
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full" />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg flex items-center justify-center">
                <Crown className="text-yellow-400" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-base mb-0.5">Miner Pass</h3>
                <p className="text-xs text-gray-400">Премиальный статус с особыми привилегиями</p>
              </div>
            </div>

            <div className="bg-[#0F1520] rounded-lg p-3 mb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-yellow-400" />
                  <span className="text-xs text-gray-400">Снятие лимитов на майнеры</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-400">Бонус +10% к хешрейту</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gem size={14} className="text-green-400" />
                  <span className="text-xs text-gray-400">Ежедневные бонусы</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">2500</span>
                </div>
                <button
                  className="px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5
                  transition-all duration-200 shadow-sm bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:shadow-md hover:translate-y-[-1px]"
                  onClick={() => handleBuySpecialItem("miner_pass", 2500)}
                  disabled={loading || balance < 2500 || hasMinerPass}
                >
                  <ShoppingCart size={12} />
                  <span>Купить</span>
                </button>
              </div>
            </div>
          </div>
          <WarningMessage />
        </>
      )}

      {/* Раздел премиум */}
      {activeCategory === "premium" && (
        <>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Crown size={16} className="text-purple-400" />
            <h2 className="text-white text-sm font-medium">Премиум майнеры</h2>
          </div>
          <p className="text-gray-400 text-xs mb-3">Эксклюзивное оборудование с максимальной эффективностью</p>

          <div className="bg-[#151B26] rounded-xl p-3 mb-3 shadow-md relative overflow-hidden">
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />

            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-purple-400" size={24} />
              </div>
              <h3 className="font-medium text-base mb-2 text-center">Премиум раздел</h3>
              <p className="text-xs text-gray-400 text-center mb-4">Этот раздел станет доступен в скором времени</p>

              <button
                className="px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5
                transition-all duration-200 shadow-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-md hover:translate-y-[-1px]"
              >
                <Bell size={12} />
                <span>Уведомить о запуске</span>
              </button>
            </div>
          </div>
          <WarningMessage />
        </>
      )}

      {/* Раздел бустов */}
      {activeCategory === "boosts" && (
        <>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Rocket size={16} className="text-green-400" />
            <h2 className="text-white text-sm font-medium">Бусты майнинга</h2>
          </div>
          <p className="text-gray-400 text-xs mb-3">Временные улучшения для ускорения добычи</p>

          <div className="bg-[#151B26] rounded-xl p-3 mb-3 shadow-md relative overflow-hidden">
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0F1520] rounded-lg p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="text-green-400" size={20} />
                </div>
                <h4 className="text-sm font-medium mb-1">+25% хешрейт</h4>
                <p className="text-xs text-gray-400 mb-2">2 часа</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-400">250</span>
                  <button className="px-2 py-1 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                    Купить
                  </button>
                </div>
              </div>

              <div className="bg-[#0F1520] rounded-lg p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg flex items-center justify-center mb-2">
                  <Droplet className="text-blue-400" size={20} />
                </div>
                <h4 className="text-sm font-medium mb-1">-20% энергия</h4>
                <p className="text-xs text-gray-400 mb-2">3 часа</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-400">300</span>
                  <button className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400">
                    Купить
                  </button>
                </div>
              </div>

              <div className="bg-[#0F1520] rounded-lg p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center mb-2">
                  <Gauge className="text-purple-400" size={20} />
                </div>
                <h4 className="text-sm font-medium mb-1">+15% эффект</h4>
                <p className="text-xs text-gray-400 mb-2">6 часов</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-400">350</span>
                  <button className="px-2 py-1 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400">
                    Купить
                  </button>
                </div>
              </div>
            </div>
          </div>
          <WarningMessage />
        </>
      )}
    </div>
  )
}

// Экспорт по умолчанию для совместимости
export default Shop

