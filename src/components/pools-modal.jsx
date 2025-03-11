"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function PoolsModal({ onClose, user, currentPool, onPoolSelect }) {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)

  // Загрузка данных о пулах
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true)

        // Получаем доступные пулы
        const { data, error } = await supabase.from("pools").select("*").order("difficulty", { ascending: true })

        if (error) throw error

        setPools(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке пулов:", err)
        setLoading(false)
      }
    }

    fetchPools()
  }, [])

  // Функция для выбора пула
  const handleSelectPool = (pool) => {
    if (onPoolSelect) {
      onPoolSelect(pool)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#242838]/95 backdrop-blur-sm p-4 rounded-lg w-[90%] max-w-md border border-blue-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">Майнинг пулы</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Пулы недоступны</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentPool?.id === pool.id
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-[#1a1d2d] border-[#2a2f45] hover:border-blue-500/50"
                }`}
                onClick={() => handleSelectPool(pool)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    {/* Иконка пула */}
                    <span className="text-2xl">🌊</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{pool.name}</h4>
                    <p className="text-sm text-gray-400">{pool.description}</p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">
                    Сложность: <span className="text-blue-400">{pool.difficulty}</span>
                  </div>
                  <div className="text-gray-400">
                    Награда: <span className="text-blue-400">x{pool.reward_multiplier}</span>
                  </div>
                  <div className="text-gray-400">
                    Стабильность: <span className="text-blue-400">{pool.stability}%</span>
                  </div>
                  <div className="text-gray-400">
                    Комиссия: <span className="text-blue-400">{pool.fee}%</span>
                  </div>
                </div>

                {currentPool?.id === pool.id && (
                  <div className="mt-2 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      Текущий пул
                    </span>
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

