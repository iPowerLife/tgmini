"use client"

import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function BottomMenu() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Функция для сброса прокрутки при клике на пункт меню
  const handleNavClick = () => {
    // Логируем действие
    console.log("🔄 Navigation menu click, scrolling to top")

    // Сбрасываем прокрутку несколькими способами для максимальной совместимости
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0

    // Пытаемся найти основной контейнер и сбросить его прокрутку
    const mainContainer = document.querySelector("#root")
    if (mainContainer) {
      mainContainer.scrollTop = 0
    }

    // Форсируем сброс прокрутки для всех потенциальных контейнеров
    Array.from(document.querySelectorAll(".page-content")).forEach((el) => {
      el.scrollTop = 0
    })

    // Для Telegram Mini App
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.expand?.()
      } catch (e) {
        console.error("Error using Telegram WebApp API:", e)
      }
    }

    // Дополнительная попытка сброса прокрутки с задержкой
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0

      // Форсируем сброс прокрутки для всех потенциальных контейнеров
      Array.from(document.querySelectorAll(".page-content")).forEach((el) => {
        el.scrollTop = 0
      })
    }, 50)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+15px)]">
      <nav className="flex items-center justify-around h-14 max-w-md mx-auto px-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
          onClick={handleNavClick}
        >
          {isActive("/") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Home className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Главная</span>
          </div>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/shop") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
          onClick={handleNavClick}
        >
          {isActive("/shop") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <ShoppingBag className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Магазин</span>
          </div>
        </Link>

        <Link
          to="/tasks"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/tasks") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
          onClick={handleNavClick}
        >
          {isActive("/tasks") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Target className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Задания</span>
          </div>
        </Link>

        <Link
          to="/rating"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/rating") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
          onClick={handleNavClick}
        >
          {isActive("/rating") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Trophy className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Рейтинг</span>
          </div>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/profile") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
          onClick={handleNavClick}
        >
          {isActive("/profile") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <User className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Профиль</span>
          </div>
        </Link>
      </nav>
    </div>
  )
}

