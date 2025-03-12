"use client"

import { useState } from "react"
import { Crown, Shield, Zap, Gem, Coins, ShoppingCart, Sparkles } from "lucide-react"
import { supabase } from "../../supabase"

export function SpecialTab({ user, onPurchase, hasMinerPass = false }) {
  const [loading, setLoading] = useState(false)
  const balance = user?.balance || 0

  // Обработчик покупки специального предмета
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

  return (
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
    </>
  )
}

