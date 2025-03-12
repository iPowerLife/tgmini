"use client"

import { useRef, useEffect } from "react"
import { ShoppingCart, Sparkles, Crown, Rocket } from "lucide-react"

export function CategoryNavigation({ activeCategory, onCategoryChange }) {
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

