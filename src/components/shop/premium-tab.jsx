"use client"
import { Crown, Lock, Bell } from "lucide-react"

export function PremiumTab() {
  return (
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
  )
}

