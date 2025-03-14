"use client"

import { useState } from "react"
import { CategoryNavigation } from "../components/shop/category-navigation"
import { MinersTab } from "../components/shop/miners-tab"
import { BoostsTab } from "../components/shop/boosts-tab"
import { SpecialTab } from "../components/shop/special-tab"
import { PremiumTab } from "../components/shop/premium-tab"
import { WarningMessage } from "../components/shop/warning-message"

const ShopPage = ({ user, onBalanceUpdate }) => {
  const [shopCategory, setShopCategory] = useState("miners")

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Магазин</h2>

      <WarningMessage message="Все покупки совершаются за игровую валюту и не требуют реальных денег." />

      {/* Баланс пользователя */}
      <div className="bg-[#1A1F2E] p-3 rounded-lg mb-4 text-center">
        <p className="font-bold text-blue-400">Баланс: {user?.balance || 0} 💎</p>
      </div>

      <CategoryNavigation activeCategory={shopCategory} onCategoryChange={setShopCategory} />

      {shopCategory === "miners" && <MinersTab user={user} onPurchase={onBalanceUpdate} />}

      {shopCategory === "boosts" && <BoostsTab user={user} onPurchase={onBalanceUpdate} />}

      {shopCategory === "special" && <SpecialTab user={user} onPurchase={onBalanceUpdate} />}

      {shopCategory === "premium" && <PremiumTab user={user} onPurchase={onBalanceUpdate} />}
    </div>
  )
}

export default ShopPage

