"use client"

import React, { useState, useEffect } from "react"
import { Zap, Gauge, Crown, Loader } from "lucide-react"
import { supabase } from "../../supabase"

// Компонент карточки майнера
const MinerCard = ({ miner, onBuy, userBalance, loading, currentQuantity, purchaseLimit, hasMinerPass, minerType }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B1622] rounded-lg">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={getMinerImageUrl(miner) || "/placeholder.svg"}
            alt={miner.display_name}
            className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ background: "#0B1622" }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true)
              setImageLoaded(true)
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

// Компонент навигации по типам майнеров
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
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Компонент вкладки майнеров
export function MinersTab({ user, onPurchase }) {
  const [activeType, setActiveType] = useState("basic")
  const [filteredModels, setFilteredModels] = useState({
    basic: [],
    advanced: [],
    premium: [],
  })
  const [loading, setLoading] = useState(false)
  const [categoryMap, setCategoryMap] = useState({})
  const [userMinersData, setUserMinersData] = useState({})
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [hasMinerPass, setHasMinerPass] = useState(false)

  // Получаем баланс пользователя
  const balance = user?.balance || 0

  // Загружаем данные о категориях и моделях майнеров
  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    }

    fetchData()
  }, [user?.id])

  // Загружаем данные о майнерах пользователя из user_miners_optimized
  useEffect(() => {
    const fetchUserMinersOptimized = async () => {
      if (!user?.id) return

      try {
        // Получаем данные из user_miners_optimized
        const { data, error } = await supabase.rpc("get_user_miners_with_models", {
          user_id_param: user.id,
        })

        if (error) {
          console.error("Ошибка при загрузке майнеров пользователя:", error)
          return
        }

        // Преобразуем данные в удобный формат
        const minersMap = {}
        data.forEach((item) => {
          minersMap[item.model.id] = item.quantity
        })

        setUserMinersData(minersMap)
      } catch (err) {
        console.error("Ошибка при загрузке майнеров пользователя:", err)
      }
    }

    fetchUserMinersOptimized()
  }, [user?.id])

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
      } else if (name.includes("продвинут") || name.includes("advanced") || name.includes("pro")) {
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

  // Обработчик покупки майнера
  const handleBuyMiner = async (modelId, price) => {
    try {
      setLoading(true)
      console.log("Покупка майнера:", modelId, "цена:", price)

      // Вызываем функцию покупки майнера
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        miner_model_id_param: modelId,
      })

      if (error) {
        console.error("Ошибка при вызове purchase_miner:", error)
        throw error
      }

      console.log("Результат покупки:", data)

      if (data && data.success) {
        // Обновляем локальные данные о майнерах пользователя
        setUserMinersData((prev) => {
          const newData = { ...prev }
          if (newData[modelId]) {
            newData[modelId] += 1
          } else {
            newData[modelId] = 1
          }
          return newData
        })

        // Вызываем колбэк для обновления баланса в родительском компоненте
        if (onPurchase && typeof onPurchase === "function") {
          onPurchase(data.new_balance)
        }

        alert("Майнер успешно куплен!")
      } else {
        alert(data?.error || "Ошибка при покупке. Недостаточно средств или достигнут лимит.")
      }
    } catch (error) {
      console.error("Error purchasing miner:", error)
      alert("Ошибка при покупке майнера: " + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-3">
      {/* Подкатегории для раздела майнеров */}
      <MinerTypesNavigation activeType={activeType} onTypeChange={setActiveType} />

      {/* Заголовок и описание категории с информацией о доступном количестве */}
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
                    if (activeType === "advanced")
                      return name.includes("продвинут") || name.includes("advanced") || name.includes("pro")
                    if (activeType === "premium") return name.includes("премиум") || name.includes("premium")
                    return false
                  })
                  .map((cat) => cat.id)

                // Считаем количество майнеров у пользователя в этой категории
                let totalUserMiners = 0

                // Используем данные из user_miners_optimized
                models.forEach((model) => {
                  if (categoryIds.includes(model.category_id) && userMinersData[model.id]) {
                    totalUserMiners += userMinersData[model.id]
                  }
                })

                // Находим лимит для этой категории
                const categoryLimit =
                  categories.find((cat) => {
                    const name = (cat.name || cat.display_name || "").toLowerCase()
                    if (activeType === "basic") return name.includes("базов") || name.includes("basic")
                    if (activeType === "advanced")
                      return name.includes("продвинут") || name.includes("advanced") || name.includes("pro")
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

      {/* Список майнеров по категориям */}
      {(activeType === "basic"
        ? filteredModels.basic
        : activeType === "advanced"
          ? filteredModels.advanced
          : filteredModels.premium
      )?.map((miner) => {
        // Получаем количество этого майнера у пользователя из user_miners_optimized
        const currentQuantity = userMinersData[miner.id] || 0

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
            minerType={activeType}
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
  )
}

