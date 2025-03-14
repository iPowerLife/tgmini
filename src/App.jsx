"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Простая проверка соединения с Supabase
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from("users").select("id").limit(1)

        if (error) {
          setError(`Ошибка подключения к базе данных: ${error.message}`)
        }
      } catch (err) {
        setError(`Непредвиденная ошибка: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A1F2E] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A1F2E] text-white">
        <div className="text-center max-w-md p-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Ошибка</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1A1F2E] text-white">
      {/* Верхний блок с заголовком */}
      <div className="bg-[#242838]/80 p-3 text-center">
        <h1 className="font-bold text-xl">Майнинг Игра</h1>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-500/80 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💎</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Приложение работает!</h2>
          <p className="text-gray-400">Базовый контент отображается корректно.</p>
        </div>
      </div>

      {/* Нижнее меню */}
      <div className="bg-[#242838]/80 p-3 flex justify-around">
        <button className="p-2">🏠</button>
        <button className="p-2">🛒</button>
        <button className="p-2">📋</button>
        <button className="p-2">👤</button>
      </div>
    </div>
  )
}

export default App

