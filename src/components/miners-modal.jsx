"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function MinersModal({ onClose, user }) {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [activeMiner, setActiveMiner] = useState(null)

  // Загрузка данных о майнерах пользователя и активном майнере
  useEffect(() => {
    // Исправляем запрос к базе данных для получения майнеров

    // Заменяем функцию fetchMiners в useEffect на следующую:
    const fetchMiners = async () => {
      try {
        setLoading(true)

        if (!user?.id) {
          setLoading(false)
          return
        }

        // Получаем майнеры пользователя - проверяем структуру таблиц
        console.log("Загрузка майнеров для пользователя:", user.id)

        // Сначала проверим, какие таблицы доступны
        const { data: tables } = await supabase.from("miners").select("*").limit(1)

        console.log("Доступные данные из таблицы miners:", tables)

        // Пробуем прямой запрос к таблице miners
        const { data: minersData, error: minersError } = await supabase
          .from("miners")
          .select("*")
          .eq("user_id", user.id)

        if (minersError) {
          console.error("Ошибка при запросе miners:", minersError)
        } else {
          console.log("Данные miners:", minersData)
        }

        // Форматируем данные майнеров
        const formattedMiners = minersData
          ? minersData.map((miner) => ({
              id: miner.id,
              name: miner.name || "Майнер",
              power: miner.power || 0,
              level: miner.level || 1,
              energy: miner.energy_usage || 0,
              income_per_hour: miner.income_per_hour || 0,
              image: "⚒️",
            }))
          : []

        setMiners(formattedMiners)

        // Проверяем, есть ли активный майнер
        if (user.active_miner_id) {
          setActiveMiner(user.active_miner_id)

          // Также устанавливаем выбранный майнер как активный
          const active = formattedMiners.find((m) => m.id === user.active_miner_id)
          if (active) {
            setSelectedMiner(active)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке майнеров:", err)
        setLoading(false)
      }
    }

    fetchMiners()
  }, [user])

  // Функция для расчета мощности майнера с учетом уровня
  const calculatePower = (basePower, level) => {
    return Math.round(basePower * (1 + (level - 1) * 0.15))
  }

  // Функция для расчета энергопотребления майнера с учетом уровня
  const calculateEnergy = (baseEnergy, level) => {
    return Math.round(baseEnergy * (1 + (level - 1) * 0.1))
  }

  // Функция для выбора майнера
  const handleSelectMiner = (miner) => {
    setSelectedMiner(miner)
  }

  // Функция для активации майнера
  const activateMiner = async (minerId) => {
    // Также упрощаем функцию активации майнера
    try {
      console.log("Активация майнера:", minerId)

      // Обновляем активный майнер в базе данных
      const { error } = await supabase.from("users").update({ active_miner_id: minerId }).eq("id", user.id)

      if (error) {
        console.error("Ошибка при обновлении active_miner_id:", error)
        throw error
      }

      // Обновляем состояние
      setActiveMiner(minerId)

      // Показываем уведомление об успехе
      alert("Майнер успешно активирован!")
    } catch (error) {
      console.error("Ошибка при активации майнера:", error)
      alert("Не удалось активировать майнер")
    }
  }

  // Функция для улучшения майнера
  const upgradeMiner = async (minerId) => {
    // Упрощаем функцию улучшения майнера
    try {
      console.log("Улучшение майнера:", minerId)

      // Получаем текущий уровень майнера
      const miner = miners.find((m) => m.id === minerId)
      if (!miner) return

      // Рассчитываем стоимость улучшения
      const upgradeCost = Math.round(100 * Math.pow(1.5, miner.level - 1))

      // Проверяем, достаточно ли у пользователя средств
      if (user.balance < upgradeCost) {
        alert(`Недостаточно средств! Требуется ${upgradeCost} 💎`)
        return
      }

      // Обновляем уровень майнера
      const { error: minerError } = await supabase
        .from("miners")
        .update({ level: miner.level + 1 })
        .eq("id", minerId)

      if (minerError) {
        console.error("Ошибка при обновлении уровня майнера:", minerError)
        throw minerError
      }

      // Списываем средства с баланса пользователя
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: user.balance - upgradeCost })
        .eq("id", user.id)

      if (balanceError) {
        console.error("Ошибка при обновлении баланса:", balanceError)
        throw balanceError
      }

      // Обновляем список майнеров
      setMiners(
        miners.map((m) => {
          if (m.id === minerId) {
            return {
              ...m,
              level: m.level + 1,
              power: Math.round(m.power * 1.15),
              energy: Math.round(m.energy * 1.1),
            }
          }
          return m
        }),
      )

      // Показываем уведомление об успехе
      alert(`Майнер улучшен до уровня ${miner.level + 1}!`)
    } catch (error) {
      console.error("Ошибка при улучшении майнера:", error)
      alert("Не удалось улучшить майнер")
    }
  }

  // Функция для получения цвета в зависимости от редкости
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "blue"
      case "rare":
        return "purple"
      case "epic":
        return "orange"
      case "legendary":
        return "yellow"
      default:
        return "blue"
    }
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
                onClose()
                // Перенаправление в магазин
                window.location.href = "/shop"
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
                  <div
                    className={`w-12 h-12 bg-${getRarityColor(miner.rarity)}-500/20 rounded-lg flex items-center justify-center mr-3`}
                  >
                    {/* Иконка майнера */}
                    {typeof miner.image === "string" && miner.image.startsWith("http") ? (
                      <img
                        src={miner.image || "/placeholder.svg"}
                        alt={miner.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{miner.image || "⚒️"}</span>
                    )}
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

                  {activeMiner === miner.id && (
                    <div className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Активен</div>
                  )}
                </div>

                {selectedMiner?.id === miner.id && (
                  <div className="mt-3 pt-3 border-t border-blue-500/30">
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>
                        Доход: <span className="text-blue-400">{Math.round(miner.power * 0.1 * 100) / 100} 💎/час</span>
                      </p>
                      <p>
                        Энергопотребление: <span className="text-blue-400">{miner.energy}/час</span>
                      </p>
                      <p>
                        Стоимость улучшения:{" "}
                        <span className="text-blue-400">{Math.round(100 * Math.pow(1.5, miner.level - 1))} 💎</span>
                      </p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        className={`flex-1 ${
                          activeMiner === miner.id ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        } text-white py-1.5 px-3 rounded-lg text-sm transition-colors`}
                        onClick={() => activeMiner !== miner.id && activateMiner(miner.id)}
                        disabled={activeMiner === miner.id}
                      >
                        {activeMiner === miner.id ? "Активирован" : "Активировать"}
                      </button>
                      <button
                        className="bg-[#2a2f45] hover:bg-[#353b58] text-gray-300 py-1.5 px-3 rounded-lg text-sm transition-colors"
                        onClick={() => upgradeMiner(miner.id)}
                      >
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

