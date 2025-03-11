"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function BoostsModal({ onClose, user }) {
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Загрузка данных о бустах
  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        setLoading(true)

        // Получаем доступные бусты
        const { data, error } = await supabase.from("boosts").select("*").order("power", { ascending: false })

        if (error) throw error

        setBoosts(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке бустов:", err)
        setLoading(false)
      }
    }

    fetchBoosts()
  }, [])

  // Функция для активации буста
  const activateBoost = async (boostId) => {
    try {
      // Здесь логика активации буста
      console.log("Активирован буст:", boostId)
    } catch (error) {
      console.error("Ошибка при активации буста:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-[#242838]/95 backdrop-blur-sm p-4 rounded-lg w-[90%] max-w-md border border-blue-500/20"
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">Бусты</h3>
          <button className="text-gray-400 hover:text-white transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : boosts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Бусты недоступны</p>
          </div>
        ) : (
          <div
            className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar"
            style={{ overflowY: "auto", maxHeight: "60vh" }}
          >
            {boosts.map((boost) => (
              <div
                key={boost.id}
                className="p-3 rounded-lg border border-[#2a2f45] bg-[#1a1d2d] hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                    {/* Иконка буста */}
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{boost.name}</h4>
                    <p className="text-sm text-gray-400">{boost.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <span>
                      Бонус: <span className="text-blue-400">+{boost.power}%</span>
                    </span>
                    <span className="ml-3">
                      Время: <span className="text-blue-400">{boost.duration} мин</span>
                    </span>
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-lg text-sm transition-colors"
                    onClick={() => activateBoost(boost.id)}
                  >
                    Активировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx global>{`
  .custom-scrollbar {
    -ms-overflow-style: none;  /* IE и Edge */
    scrollbar-width: none;     /* Firefox */
    overscroll-behavior: contain;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari и Opera */
    width: 0;
    height: 0;
  }
`}</style>
      </div>
    </div>
  )
}

