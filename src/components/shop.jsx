"use client"

import { useState } from "react"
import { ShoppingCart, Zap, Battery, Gauge, Crown, Sparkles, Rocket } from "lucide-react"

// Компонент карточки майнера
const MinerCard = ({ miner, onBuy }) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg mb-1">{miner.name}</h3>
          <p className="text-sm text-gray-400">{miner.description}</p>
        </div>
        {miner.isNew && <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Новинка</span>}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <img
          src={miner.image || "/placeholder.svg?height=100&width=100"}
          alt={miner.name}
          className="w-full h-32 object-contain mb-4"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={16} className="text-blue-400" />
              <span>Хешрейт:</span>
            </div>
            <span className="font-medium">{miner.hashrate} TH/s</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Battery size={16} className="text-purple-400" />
              <span>Потребление:</span>
            </div>
            <span className="font-medium">{miner.power} kW</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Gauge size={16} className="text-green-400" />
              <span>Эффективность:</span>
            </div>
            <span className="font-medium">{miner.efficiency}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-blue-400">{miner.price} монет</div>
        <button onClick={() => onBuy(miner)} className="bg-green-500 text-black font-medium px-6 py-2 rounded-lg">
          Купить
        </button>
      </div>
    </div>
  )
}

// Компонент категории майнеров
const MinerCategory = ({ title, description, miners, onBuy }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="text-blue-400" size={20} />
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="space-y-4">
        {miners.map((miner) => (
          <MinerCard key={miner.id} miner={miner} onBuy={onBuy} />
        ))}
      </div>
    </div>
  )
}

// Главный компонент магазина
const Shop = ({ balance = 0, onBuy }) => {
  const [activeCategory, setActiveCategory] = useState("shop")
  const [activeType, setActiveType] = useState("basic")

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

  // Примеры майнеров (в реальном приложении данные будут приходить с сервера)
  const miners = {
    basic: [
      {
        id: 1,
        name: "Basic Miner S1",
        description: "Начальная модель для входа в майнинг",
        hashrate: "25",
        power: "2.2",
        efficiency: "92",
        price: 1000,
        isNew: true,
      },
      {
        id: 2,
        name: "Basic Miner S2",
        description: "Улучшенная базовая модель с оптимальным энергопотреблением",
        hashrate: "30",
        power: "2.4",
        efficiency: "93",
        price: 1500,
      },
    ],
    advanced: [
      {
        id: 3,
        name: "Advanced Miner X1",
        description: "Продвинутая модель для опытных майнеров",
        hashrate: "45",
        power: "3.0",
        efficiency: "95",
        price: 2500,
      },
    ],
    premium: [
      {
        id: 4,
        name: "Premium Miner Pro",
        description: "Премиальная модель с максимальной производительностью",
        hashrate: "75",
        power: "4.5",
        efficiency: "97",
        price: 5000,
      },
    ],
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

      {/* Список майнеров */}
      {activeType === "basic" && (
        <MinerCategory
          title="Базовые майнеры"
          description="Оптимальное решение для начала"
          miners={miners.basic}
          onBuy={onBuy}
        />
      )}
      {activeType === "advanced" && (
        <MinerCategory
          title="Продвинутые майнеры"
          description="Для опытных пользователей"
          miners={miners.advanced}
          onBuy={onBuy}
        />
      )}
      {activeType === "premium" && (
        <MinerCategory
          title="Премиум майнеры"
          description="Максимальная производительность"
          miners={miners.premium}
          onBuy={onBuy}
        />
      )}
    </div>
  )
}

export default Shop

