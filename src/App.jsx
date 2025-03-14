"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("home")
  const [user, setUser] = useState(null)

  // Проверка соединения с Supabase и загрузка данных пользователя
  useEffect(() => {
    const initApp = async () => {
      try {
        // Получаем текущую сессию
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Загружаем данные пользователя
          const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error) {
            throw error
          }

          if (data) {
            setUser(data)
          }
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err)
        setError(`Ошибка загрузки данных: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    initApp()
  }, [])

  // Инициализация Telegram WebApp (если доступен)
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        console.log("Telegram WebApp инициализирован")
      } catch (err) {
        console.warn("Ошибка инициализации Telegram WebApp:", err)
      }
    }
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

  // Рендерим контент в зависимости от активной вкладки
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-500/80 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💎</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Майнинг</h2>
            <p className="text-gray-400 mb-4">Добывайте криптовалюту и получайте награды</p>

            {user && (
              <div className="bg-[#242838]/80 p-3 rounded-lg">
                <p className="font-bold text-blue-400">Баланс: {user.balance || 0} 💎</p>
                <p className="text-sm text-gray-400">Miner Pass: {user.hasMinerPass ? "Активен ✨" : "Не активен"}</p>
              </div>
            )}
          </div>
        )

      case "shop":
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Магазин</h2>
            <p className="text-gray-400 mb-4">Здесь вы можете приобрести майнеры и улучшения</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#242838]/80 p-3 rounded-lg">
                <div className="text-blue-400 text-xl mb-2">🖥️</div>
                <p className="font-semibold">Майнеры</p>
              </div>
              <div className="bg-[#242838]/80 p-3 rounded-lg">
                <div className="text-yellow-400 text-xl mb-2">⚡</div>
                <p className="font-semibold">Бусты</p>
              </div>
            </div>
          </div>
        )

      case "tasks":
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Задания</h2>
            <p className="text-gray-400 mb-4">Выполняйте задания и получайте награды</p>

            <div className="space-y-3">
              <div className="bg-[#242838]/80 p-3 rounded-lg text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Ежедневный бонус</h3>
                    <p className="text-sm text-gray-400">Получите бонус за вход в игру</p>
                  </div>
                  <div className="text-blue-400">+50 💎</div>
                </div>
              </div>

              <div className="bg-[#242838]/80 p-3 rounded-lg text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Пригласить друга</h3>
                    <p className="text-sm text-gray-400">Пригласите друга и получите бонус</p>
                  </div>
                  <div className="text-blue-400">+100 💎</div>
                </div>
              </div>
            </div>
          </div>
        )

      case "profile":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{user?.display_name || "Пользователь"}</h2>
            <p className="text-gray-400 mb-4">ID: {user?.id?.substring(0, 8) || "Не авторизован"}</p>

            <div className="bg-[#242838]/80 p-3 rounded-lg mb-3">
              <p className="font-bold text-blue-400">Баланс: {user?.balance || 0} 💎</p>
              <p className="text-sm text-gray-400">Miner Pass: {user?.hasMinerPass ? "Активен ✨" : "Не активен"}</p>
            </div>

            <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded w-full">Выйти</button>
          </div>
        )

      default:
        return <div>Страница не найдена</div>
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1A1F2E] text-white">
      {/* Верхний блок с заголовком */}
      <div className="bg-[#242838]/80 p-3 text-center">
        <h1 className="font-bold text-xl">Майнинг Игра</h1>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-auto p-4">{renderContent()}</div>

      {/* Нижнее меню */}
      <div className="bg-[#242838]/80 p-3 flex justify-around">
        <button
          className={`p-2 rounded-lg ${activeTab === "home" ? "bg-blue-500/50" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          🏠
        </button>
        <button
          className={`p-2 rounded-lg ${activeTab === "shop" ? "bg-blue-500/50" : ""}`}
          onClick={() => setActiveTab("shop")}
        >
          🛒
        </button>
        <button
          className={`p-2 rounded-lg ${activeTab === "tasks" ? "bg-blue-500/50" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          📋
        </button>
        <button
          className={`p-2 rounded-lg ${activeTab === "profile" ? "bg-blue-500/50" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤
        </button>
      </div>
    </div>
  )
}

export default App

