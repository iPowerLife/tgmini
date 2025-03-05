"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Zap, Battery, Gauge, Crown, Sparkles, Rocket } from "lucide-react"

// Компонент карточки майнера
const MinerCard = ({ miner, onBuy, userBalance }) => {
  // Проверяем, может ли пользователь купить майнер
  const canBuy = userBalance >= miner.price

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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-blue-400">{miner.price} монет</div>
        <button
          onClick={() => onBuy(miner)}
          className={`px-6 py-2 rounded-lg font-medium ${
            canBuy ? "bg-green-500 text-black hover:bg-green-600" : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!canBuy}
        >
          {canBuy ? "Купить" : "Недостаточно средств"}
        </button>
      </div>
    </div>
  )
}

// Компонент категории майнеров
const MinerCategory = ({ title, description, miners, onBuy, userBalance }) => {
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
          miners.map((miner) => <MinerCard key={miner.id} miner={miner} onBuy={onBuy} userBalance={userBalance} />)
        )}
      </div>
    </div>
  )
}

// Главный компонент магазина
export const Shop = ({ user, onPurchase, categories = [], models = [] }) => {
  const [activeCategory, setActiveCategory] = useState("shop")
  const [activeType, setActiveType] = useState("basic")
  const [categoryMap, setCategoryMap] = useState({})
  const [filteredModels, setFilteredModels] = useState({})

  // Получаем баланс пользователя
  const balance = user?.balance || 0

  // Обработчик покупки
  const handleBuy = async (miner) => {
    if (!user || !miner || balance < miner.price) return

    try {
      // Здесь должен быть код для покупки майнера через API
      console.log(`Покупка майнера: ${miner.name} за ${miner.price} монет`)

      // Вызываем функцию обновления баланса из родительского компонента
      if (onPurchase && typeof onPurchase === "function") {
        // Предполагаем, что после покупки баланс уменьшится на цену майнера
        onPurchase(balance - miner.price)
      }
    } catch (error) {
      console.error("Ошибка при покупке майнера:", error)
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

    // Группируем модели по категориям
    const modelsByCategory = {
      basic: [],
      advanced: [],
      premium: [],
    }

    // Распределяем модели по категориям
    models.forEach((model) => {
      const category = catMap[model.category_id]
      if (!category) return

      // Определяем тип категории по имени
      let categoryType = "basic"
      if (category.name.toLowerCase().includes("продвинут")) {
        categoryType = "advanced"
      } else if (category.name.toLowerCase().includes("премиум")) {
        categoryType = "premium"
      }

      // Добавляем модель в соответствующую категорию
      if (modelsByCategory[categoryType]) {
        modelsByCategory[categoryType].push(model)
      }
    })

    setFilteredModels(modelsByCategory)

    // Если нет активного типа или в активном типе нет моделей, выбираем первый непустой тип
    if (!modelsByCategory[activeType] || modelsByCategory[activeType].length === 0) {
      for (const type of ["basic", "advanced", "premium"]) {
        if (modelsByCategory[type] && modelsByCategory[type].length > 0) {
          setActiveType(type)
          break
        }
      }
    }
  }, [categories, models, activeType])

  // Категории навигации
  const navCategories = [
    { id: "shop", name: "Магазин", icon: ShoppingCart },
    { id: "premium", name: "Премиум", icon: Crown },
    { id: "special", name: "Специальные", icon: Sparkles },
    { id: "boosts", name: "Бусты", icon: Rocket },
  ]

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
    <div className="min-h-screen pb-20">
      {/* Верхняя панель */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-green-500" size={20} />
          <span className="font-medium">Магазин</span>
        </div>
        <div className="text-green-500 font-medium">{balance} монет</div>
      </div>

      {/* Навигация по категориям */}
      <div className="bg-gray-900 rounded-2xl p-2 mb-4">
        <div className="flex gap-2">
          {navCategories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 justify-center ${
                  activeCategory === category.id ? "bg-gray-800 text-white" : "text-gray-400"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Типы майнеров */}
      <div className="bg-gray-900 rounded-2xl p-2 mb-4">
        <div className="flex gap-2">
          {minerTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 justify-center ${
                  activeType === type.id ? "bg-gray-800 text-white" : "text-gray-400"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{type.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Список майнеров по категориям */}
      {activeType === "basic" && (
        <MinerCategory
          title={categoryTitles.basic}
          description={categoryDescriptions.basic}
          miners={filteredModels.basic || []}
          onBuy={handleBuy}
          userBalance={balance}
        />
      )}
      {activeType === "advanced" && (
        <MinerCategory
          title={categoryTitles.advanced}
          description={categoryDescriptions.advanced}
          miners={filteredModels.advanced || []}
          onBuy={handleBuy}
          userBalance={balance}
        />
      )}
      {activeType === "premium" && (
        <MinerCategory
          title={categoryTitles.premium}
          description={categoryDescriptions.premium}
          miners={filteredModels.premium || []}
          onBuy={handleBuy}
          userBalance={balance}
        />
      )}
    </div>
  )
}

// Экспорт по умолчанию для совместимости
export default Shop

