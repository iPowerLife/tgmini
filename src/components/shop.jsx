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
  Cpu,
  Gem,
  Droplet,
  Bolt,
  Coins,
  Loader,
  AlertCircle,
  ChevronRight,
  Lock,
  Bell,
  Flame,
} from "lucide-react"
import { supabase } from "../supabase"

// Обновляем компонент карточки майнера, добавляя обратно поле Энергия
const MinerCard = ({ miner, onBuy, userBalance, loading, currentQuantity, purchaseLimit, hasMinerPass, minerType }) => {
  // Проверяем, может ли пользователь купить майнер
  const canBuy = userBalance >= miner.price

  // Проверяем, не достигнут ли лимит
  const limitReached = purchaseLimit !== null && currentQuantity >= purchaseLimit && !hasMinerPass

  // Цветовые схемы для разных типов майнеров
  const colorSchemes = {
    basic: {
      icon: "text-blue-400",
      iconBg: "bg-blue-500/10",
      border: "border-blue-500/30",
      gradient: "from-blue-500/20 to-blue-600/5",
    },
    advanced: {
      icon: "text-purple-400",
      iconBg: "bg-purple-500/10",
      border: "border-purple-500/30",
      gradient: "from-purple-500/20 to-purple-600/5",
    },
    premium: {
      icon: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      gradient: "from-yellow-500/20 to-yellow-600/5",
    },
  }

  // Используем цветовую схему по умолчанию, если тип не указан
  const colorScheme = colorSchemes[minerType] || colorSchemes.basic

  return (
    <div className={`bg-[#151B26] rounded-xl p-3 mb-3 shadow-md border border-opacity-30 ${colorScheme.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-base mb-0.5">{miner.display_name || miner.name}</h3>
          <p className="text-xs text-gray-400">{miner.description || "Майнер для добычи криптовалюты"}</p>
        </div>
        {miner.is_new && (
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Новинка</span>
        )}
      </div>

      <div className={`bg-[#0F1520] rounded-lg p-3 mb-3 bg-gradient-to-br ${colorScheme.gradient}`}>
        <div className="flex items-center gap-3">
          <div className={`w-16 h-16 ${colorScheme.iconBg} rounded-lg flex items-center justify-center`}>
            <Cpu className={colorScheme.icon} size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Bolt size={14} className={colorScheme.icon} />
              <span className="text-xs text-gray-400">Хешрейт:</span>
              <span className="text-xs font-medium ml-auto">{miner.mining_power}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-gray-400">Энергия:</span>
              <span className="text-xs font-medium ml-auto">{miner.energy_consumption}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
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
          <span className="text-green-400 text-sm font-medium">{balance}</span>
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

            {/* Добавляем информацию о доступном количестве */}
            {activeType && filteredModels[activeType] && (
              <span className="text-xs text-gray-400 ml-auto">
                Доступно: {filteredModels[activeType].length}{" "}
                {filteredModels[activeType].length === 1
                  ? "модель"
                  : filteredModels[activeType].length >= 2 && filteredModels[activeType].length <= 4
                    ? "модели"
                    : "моделей"}
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
                >
                  <ShoppingCart size={12} />
                  <span>Купить</span>
                </button>
              </div>
            </div>
          </div>
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
        </>
      )}
    </div>
  )
}

// Экспорт по умолчанию для совместимости
export default Shop

