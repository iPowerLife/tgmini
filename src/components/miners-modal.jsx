"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersModal({ onClose, user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)

  // Загрузка данных о майнерах пользователя
  useEffect(() => {
    const fetchMiners = async () => {
      try {
        setLoading(true)

        // Получаем майнеры пользователя
        const { data, error } = await supabase
          .from("miners")
          .select("*")
          .eq("user_id", user?.id)
          .order("power", { ascending: false })

        if (error) throw error

        setMiners(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке майнеров:", err)
        setLoading(false)
      }
    }

    fetchMiners()
  }, [user])

  // Функция для выбора майнера
  const handleSelectMiner = (miner) => {
    setSelectedMiner(miner)
    // Здесь можно добавить логику для активации майнера
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#242838]/95 backdrop-blur-sm p-4 rounded-lg w-[90%] max-w-md border border-blue-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">Мои майнеры</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : miners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>У вас пока нет майнеров</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                /* Перенаправление в магазин */
              }}
            >
              Купить майнеры
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {miners.map((miner) => (
              <div
                key={miner.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedMiner?.id === miner.id
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-[#1a1d2d] border-[#2a2f45] hover:border-blue-500/50"
                }`}
                onClick={() => handleSelectMiner(miner)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    {/* Иконка майнера */}
                    <span className="text-2xl">⚒️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{miner.name}</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Мощность: <span className="text-blue-400">{miner.power} H/s</span>
                      </span>
                      <span className="text-gray-400">
                        Уровень: <span className="text-blue-400">{miner.level}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMiner?.id === miner.id && (
                  <div className="mt-3 pt-3 border-t border-blue-500/30">
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>
                        Доход: <span className="text-blue-400">{miner.income_per_hour} 💎/час</span>
                      </p>
                      <p>
                        Энергопотребление: <span className="text-blue-400">{miner.energy_usage}/час</span>
                      </p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-lg text-sm transition-colors">
                        Активировать
                      </button>
                      <button className="bg-[#2a2f45] hover:bg-[#353b58] text-gray-300 py-1.5 px-3 rounded-lg text-sm transition-colors">
                        Улучшить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1d2d;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 10px;
          }
        `}</style>
      </div>
    </div>
  )
}

