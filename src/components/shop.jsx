"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingCart, Zap, Battery, Gauge, Crown, Sparkles, Rocket, Clock, Shield, Check } from "lucide-react"
import { supabase } from "../supabase" // Импортируем клиент Supabase

// Компонент карточки майнера
const MinerCard = ({ miner, onBuy, userBalance, loading, currentQuantity, purchaseLimit, hasMinerPass }) => {
  // Проверяем, может ли пользователь купить майнер
  const canBuy = userBalance >= miner.price

  // Проверяем, не достигнут ли лимит
  const limitReached = purchaseLimit !== null && currentQuantity >= purchaseLimit && !hasMinerPass

  // Текст для кнопки при достижении лимита
  const limitText = hasMinerPass ? `Куплено ${currentQuantity}` : `Лимит: ${currentQuantity}/${purchaseLimit}`

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg mb-1">{miner.display_name || miner.name}</h3>
          <p className="text-sm text-gray-400">{miner.description || "Майнер для добычи криптовалюты"}</p>
        </div>
        {miner.is_new && <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Новинка</span>}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <img
          src={miner.image_url || "/placeholder.svg?height=100&width=100"}
          alt={miner.name}
          className="w-full h-32 object-contain mb-4"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={16} className="text-blue-400" />
              <span>Хешрейт:</span>
            </div>
            <span className="font-medium">{miner.mining_power} h/s</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Battery size={16} className="text-purple-400" />
              <span>Потребление:</span>
            </div>
            <span className="font-medium">{miner.energy_consumption} kW</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Gauge size={16} className="text-green-400" />
              <span>Эффективность:</span>
            </div>
            <span className="font-medium">
              {miner.efficiency || Math.round((miner.mining_power / miner.energy_consumption) * 10)}%
            </span>
          </div>

          {purchaseLimit !== null && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield size={16} className="text-yellow-400" />
                <span>Количество:</span>
              </div>
              <span className={`font-medium ${limitReached ? "text-red-400" : ""}`}>
                {currentQuantity} / {hasMinerPass ? "∞" : purchaseLimit}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-blue-400">{miner.price} монет</div>
        <button
          onClick={() => onBuy(miner.id, miner.price)}
          className={`px-6 py-2 rounded-lg font-medium ${
            loading
              ? "bg-gray-600 text-gray-300 cursor-wait"
              : limitReached
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : canBuy
                  ? "bg-green-500 text-black hover:bg-green-600"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!canBuy || loading || limitReached}
        >
          {loading ? "Покупка..." : limitReached ? limitText : canBuy ? "Купить" : "Недостаточно средств"}
        </button>
      </div>
    </div>
  )
}

// Компонент карточки специального предмета
const SpecialItemCard = ({ item, onBuy, userBalance, loading, userHasItem }) => {
  // Проверяем, может ли пользователь купить предмет
  const canBuy = userBalance >= item.price

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg mb-1">{item.display_name}</h3>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>
        {userHasItem && (
          <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check size={12} />
            <span>Активен</span>
          </span>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Crown size={48} className="text-blue-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield size={16} className="text-yellow-400" />
              <span>Преимущества:</span>
            </div>
            <span className="font-medium">Снятие лимитов</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} className="text-purple-400" />
              <span>Длительность:</span>
            </div>
            <span className="font-medium">{item.duration_days || "∞"} дней</span>
          </div>

          {userHasItem && item.expires_at && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={16} className="text-red-400" />
                <span>Истекает:</span>
              </div>
              <span className="font-medium">{new Date(item.expires_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-blue-400">{item.price} монет</div>
        <button
          onClick={() => onBuy(item.name, item.price)}
          className={`px-6 py-2 rounded-lg font-medium ${
            loading
              ? "bg-gray-600 text-gray-300 cursor-wait"
              : userHasItem
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : canBuy
                  ? "bg-green-500 text-black hover:bg-green-600"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          disabled={(!canBuy && !userHasItem) || loading}
        >
          {loading ? "Покупка..." : userHasItem ? "Продлить" : canBuy ? "Купить" : "Недостаточно средств"}
        </button>
      </div>
    </div>
  )
}

// Компонент категории майнеров
const MinerCategory = ({ title, description, miners, onBuy, userBalance, loading, userMiners, hasMinerPass }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="text-blue-400" size={20} />
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="space-y-4">
        {miners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">В этой категории пока нет доступных майнеров</div>
        ) : (
          miners.map((miner) => {
            // Находим текущее количество этого майнера у пользователя
            const userMiner = userMiners.find((um) => um.model_id === miner.id)
            const currentQuantity = userMiner ? userMiner.quantity : 0

            return (
              <MinerCard
                key={miner.id}
                miner={miner}
                onBuy={onBuy}
                userBalance={userBalance}
                loading={loading}
                currentQuantity={currentQuantity}
                purchaseLimit={miner.purchase_limit}
                hasMinerPass={hasMinerPass}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

// Компонент раздела специальных предметов
const SpecialItemsSection = ({ items, onBuy, userBalance, loading, userItems }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-yellow-400" size={20} />
        <h2 className="text-lg font-medium">Специальные предметы</h2>
      </div>
      <p className="text-gray-400 text-sm mb-4">Уникальные предметы и улучшения для вашего майнинга</p>
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">В этой категории пока нет доступных предметов</div>
        ) : (
          items.map((item) => {
            // Проверяем, есть ли у пользователя этот предмет
            const userItem = userItems.find((ui) => ui.item_id === item.id)
            const hasItem = !!userItem

            // Добавляем информацию о сроке действия
            const itemWithExpiry = {
              ...item,
              expires_at: userItem?.expires_at,
            }

            return (
              <SpecialItemCard
                key={item.id}
                item={itemWithExpiry}
                onBuy={onBuy}
                userBalance={userBalance}
                loading={loading}
                userHasItem={hasItem}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

// Обновляем компонент навигации по типам майнеров
const MinerTypesNavigation = ({ activeType, onTypeChange }) => {
  const minerTypes = [
    { id: "basic", name: "Базовый", icon: Zap },
    { id: "advanced", name: "Продвинутый", icon: Gauge },
    { id: "premium", name: "Премиум", icon: Crown },
  ]

  return (
    <div className="bg-[#0B0E14] border-b border-gray-800">
      <div className="flex px-4">
        {minerTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`
                flex items-center gap-2 py-3 px-4
                transition-all duration-200 relative
                ${isActive ? "text-[#5B9DFF]" : "text-gray-500 hover:text-gray-400"}
              `}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{type.name}</span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B9DFF]" />}
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
    { id: "premium", name: "Премиум", icon: Crown },
    { id: "special", name: "Специальные", icon: Sparkles },
    { id: "boosts", name: "Бусты", icon: Rocket },
  ]

  return (
    <div className="bg-[#0B0E14] border-b border-gray-800">
      <div className="flex">
        {navCategories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex items-center justify-center gap-2 flex-1 py-3 px-4
                transition-all duration-200 relative
                ${isActive ? "text-white" : "text-gray-500 hover:text-gray-400"}
              `}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{category.name}</span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
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

    console.log("Категории майнеров:", categoryTypes)
    console.log("Модели по категориям:", modelsByType)
  }, [categories, models, activeType])

  // Типы майнеров
  const minerTypes = [
    { id: "basic", name: "Базовый", icon: Zap },
    { id: "advanced", name: "Продвинутый", icon: Gauge },
    { id: "premium", name: "Премиум", icon: Crown },
  ]

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

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Навигация (теперь не фиксированная) */}
      <CategoryNavigation activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Подкатегории для раздела магазина */}
      {activeCategory === "shop" && <MinerTypesNavigation activeType={activeType} onTypeChange={setActiveType} />}

      {/* Основной контент */}
      <div className="p-4">
        {/* Верхняя панель с балансом */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-[#5B9DFF]" size={20} />
            <span className="text-[#5B9DFF] text-xl font-medium">
              {activeCategory === "shop"
                ? "Магазин"
                : activeCategory === "special"
                  ? "Специальные предметы"
                  : activeCategory === "premium"
                    ? "Премиум"
                    : "Бусты"}
            </span>
          </div>
          <div className="bg-green-500/10 px-3 py-1.5 rounded-lg">
            <span className="text-green-400 font-medium">{balance} монет</span>
          </div>
        </div>

        {/* Заголовок и описание категории */}
        {activeCategory === "shop" && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-medium flex items-center gap-2 mb-1">
              <Zap size={20} className="text-[#5B9DFF]" />
              {categoryTitles[activeType]}
            </h2>
            <p className="text-gray-500 text-sm">{categoryDescriptions[activeType]}</p>
          </div>
        )}

        {/* Отображаем соответствующий раздел */}
        {activeCategory === "shop" && (
          <>
            {/* Список майнеров по категориям */}
            {activeType === "basic" && (
              <MinerCategory
                miners={filteredModels.basic || []}
                onBuy={handleBuyMiner}
                userBalance={balance}
                loading={loading}
                userMiners={userMiners}
                hasMinerPass={hasMinerPass}
              />
            )}
            {activeType === "advanced" && (
              <MinerCategory
                miners={filteredModels.advanced || []}
                onBuy={handleBuyMiner}
                userBalance={balance}
                loading={loading}
                userMiners={userMiners}
                hasMinerPass={hasMinerPass}
              />
            )}
            {activeType === "premium" && (
              <MinerCategory
                miners={filteredModels.premium || []}
                onBuy={handleBuyMiner}
                userBalance={balance}
                loading={loading}
                userMiners={userMiners}
                hasMinerPass={hasMinerPass}
              />
            )}
          </>
        )}

        {/* Раздел специальных предметов */}
        {activeCategory === "special" && (
          <>
            <p className="text-gray-500 text-sm mb-6">Уникальные предметы и улучшения для вашего майнинга</p>
            <SpecialItemsSection
              items={specialItems}
              onBuy={handleBuySpecialItem}
              userBalance={balance}
              loading={loading}
              userItems={userSpecialItems}
            />
          </>
        )}

        {/* Заглушки для других разделов */}
        {activeCategory === "premium" && (
          <div className="text-center py-8 text-gray-400">Премиум раздел находится в разработке</div>
        )}

        {activeCategory === "boosts" && (
          <div className="text-center py-8 text-gray-400">Раздел бустов находится в разработке</div>
        )}
      </div>
    </div>
  )
}

// Экспорт по умолчанию для совместимости
export default Shop

