"use client"
import { Rocket, Zap, Droplet, Gauge } from "lucide-react"

export function BoostsTab() {
  return (
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
              <button className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400">Купить</button>
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
    </>
  )
}

