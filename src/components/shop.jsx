"use client"

// Находим возвращаемый JSX в компоненте Shop и меняем его
import {
  ShoppingCart,
  Coins,
  Crown,
  Shield,
  Zap,
  Gem,
  Bell,
  Rocket,
  Droplet,
  Gauge,
  Lock,
  Sparkles,
} from "lucide-react"
import React from "react"

const Shop = ({
  balance,
  CategoryNavigation,
  activeCategory,
  handleCategoryChange,
  activeType,
  setActiveType,
  categories,
  userMiners,
  models,
  filteredModels,
  categoryTitles,
  categoryDescriptions,
  categoryIcons,
  handleBuyMiner,
  loading,
  hasMinerPass,
  handleBuySpecialItem,
  WarningMessage,
  updateCounter,
}) => {
  // Предполагаем, что MinerTypesNavigation и MinerCard импортируются или определены где-то еще
  // Если они не импортируются, нужно добавить import statement
  // Например:
  // import MinerTypesNavigation from './MinerTypesNavigation';
  // import MinerCard from './MinerCard';

  const MinerTypesNavigation = ({ activeType, onTypeChange }) => {
    return (
      <div className="flex space-x-2 mb-3">
        <button
          className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === "basic" ? "bg-[#5B9DFF] text-white" : "bg-[#1F2937] text-gray-400 hover:text-white"}`}
          onClick={() => onTypeChange("basic")}
        >
          Базовые
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === "advanced" ? "bg-[#5B9DFF] text-white" : "bg-[#1F2937] text-gray-400 hover:text-white"}`}
          onClick={() => onTypeChange("advanced")}
        >
          Продвинутые
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm font-medium ${activeType === "premium" ? "bg-[#5B9DFF] text-white" : "bg-[#1F2937] text-gray-400 hover:text-white"}`}
          onClick={() => onTypeChange("premium")}
        >
          Премиум
        </button>
      </div>
    )
  }

  const MinerCard = ({
    miner,
    onBuy,
    userBalance,
    loading,
    currentQuantity,
    purchaseLimit,
    hasMinerPass,
    minerType,
  }) => {
    const canBuy = userBalance >= miner.cost && !loading
    const remaining = purchaseLimit ? Math.max(0, purchaseLimit - currentQuantity) : Number.POSITIVE_INFINITY
    const isDisabled = loading || userBalance < miner.cost || (purchaseLimit && currentQuantity >= purchaseLimit)

    return (
      <div className="bg-[#151B26] rounded-xl p-3 shadow-md relative overflow-hidden">
        {/* Декоративный элемент */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg flex items-center justify-center">
            {/* Иконка майнера */}
            {React.createElement(categoryIcons[minerType], { size: 24, className: "text-[#5B9DFF]" })}
          </div>
          <div>
            <h3 className="font-medium text-base mb-0.5">{miner.name}</h3>
            <p className="text-xs text-gray-400">{miner.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{miner.cost}</span>
          </div>
          <button
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5
                transition-all duration-200 shadow-sm ${
                  isDisabled
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md hover:translate-y-[-1px]"
                }`}
            onClick={() => onBuy(miner.id, miner.cost)}
            disabled={isDisabled}
          >
            <ShoppingCart size={12} />
            <span>Купить</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
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

export default Shop

