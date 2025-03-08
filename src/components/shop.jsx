"use client"

import { useRef, useEffect } from "react"
import { useState } from "react"
import { ShoppingCart, Zap, Gauge, Crown, Sparkles, Rocket, Loader, ChevronRight, AlertTriangle } from "lucide-react"
import { BottomMenu } from "./bottom-menu"
import { OptimizedImage } from "./optimized-image" // Импортируем компонент оптимизированного изображения

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

  // Функция для получения URL изображения майнера
  const getMinerImageUrl = (model) => {
    if (model.image_url) {
      return model.image_url
    }
    return "/images/miners/default.png"
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
          <img
            src={getMinerImageUrl(miner) || "/placeholder.svg"}
            alt={miner.display_name}
            className="w-full h-full object-contain rounded-lg"
            style={{ background: "#0B1622" }}
            onError={(e) => {
              e.target.src = "/images/miners/default.png"
              e.target.onerror = null
            }}
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
export default function Shop({ user, onPurchase, categories = [], models = [], hasMinerPass = false }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [filteredModels, setFilteredModels] = useState([])
  const [loading, setLoading] = useState(false)

  // Устанавливаем первую категорию как активную при загрузке компонента
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  // Фильтруем модели по активной категории
  useEffect(() => {
    if (activeCategory && models && models.length > 0) {
      const filtered = models.filter((model) => model.category_id === activeCategory)
      setFilteredModels(filtered)
    } else {
      setFilteredModels([])
    }
  }, [activeCategory, models])

  // Обработчик покупки майнера
  const handlePurchase = async (model) => {
    if (loading) return
    if (user.balance < model.price) {
      alert("Недостаточно средств для покупки")
      return
    }

    setLoading(true)
    try {
      // Здесь должен быть запрос к API для покупки майнера
      // Для примера просто обновляем баланс
      const newBalance = user.balance - model.price
      onPurchase(newBalance)
      alert(`Вы успешно приобрели ${model.display_name}`)
    } catch (error) {
      console.error("Ошибка при покупке майнера:", error)
      alert("Произошла ошибка при покупке майнера")
    } finally {
      setLoading(false)
    }
  }

  // Получаем запасное изображение для майнера
  const getFallbackImage = (categoryId) => {
    switch (categoryId) {
      case 1: // Базовые
        return "https://cdn-icons-png.flaticon.com/512/2991/2991109.png"
      case 2: // Продвинутые
        return "https://cdn-icons-png.flaticon.com/512/2991/2991117.png"
      case 3: // Премиум
        return "https://cdn-icons-png.flaticon.com/512/2991/2991107.png"
      default:
        return "https://cdn-icons-png.flaticon.com/512/2991/2991109.png"
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E] pb-16">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Магазин майнеров</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Приобретайте майнеры для увеличения дохода</p>

        {/* Баланс */}
        <div className="bg-[#242838] rounded-xl p-4 mb-6 border border-[#2A3142]/70 text-center">
          <p className="text-gray-400 text-sm">Ваш баланс</p>
          <p className="text-2xl font-bold text-white">{user?.balance?.toFixed(2)} 💎</p>
        </div>

        {/* Категории */}
        <div className="flex overflow-x-auto no-scrollbar mb-6 bg-[#242838] rounded-lg p-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-1
                ${activeCategory === category.id ? "bg-blue-500 text-white" : "text-gray-400 hover:text-gray-300"}
              `}
            >
              {category.display_name}
            </button>
          ))}
        </div>

        {/* Список моделей */}
        <div className="space-y-4 pb-20">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-[#242838] rounded-xl overflow-hidden border border-[#2A3142]/70 shadow-lg"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    {/* Используем OptimizedImage вместо обычного img */}
                    <OptimizedImage
                      src={model.image_url}
                      alt={model.display_name}
                      fallbackSrc={getFallbackImage(model.category_id)}
                      className="w-12 h-12 rounded-lg mr-3"
                      priority={true}
                    />
                    <div>
                      <h3 className="text-white font-medium">{model.display_name}</h3>
                      <p className="text-gray-400 text-xs">{model.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#1A1F2E] rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">Мощность</p>
                      <p className="text-white font-medium">{model.mining_power} MH/s</p>
                    </div>
                    <div className="bg-[#1A1F2E] rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">Энергия</p>
                      <p className="text-white font-medium">{model.energy_consumption} W</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-blue-400 font-bold">{model.price.toFixed(2)} 💎</div>
                    <button
                      onClick={() => handlePurchase(model)}
                      disabled={loading || user.balance < model.price}
                      className={`
                        px-4 py-2 rounded-full font-medium transition-all
                        ${
                          user.balance < model.price
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-400 text-white"
                        }
                      `}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        "Купить"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>Нет доступных моделей в этой категории</p>
            </div>
          )}
        </div>
      </div>
      <BottomMenu active="shop" />
    </div>
  )
}

