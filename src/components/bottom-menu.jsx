"use client"

import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export default function BottomMenu() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Добавляем функцию для сброса скролла
  const handleClick = () => {
    window.scrollTo(0, 0)
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-gradient-to-t from-gray-950 to-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 z-50">
      <nav className="flex items-center justify-around h-14 max-w-md mx-auto px-4 pb-[env(safe-area-inset-bottom)]">
        <Link
          to="/"
          onClick={handleClick}
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Home className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Главная</span>
          </div>
        </Link>

        <Link
          to="/shop"
          onClick={handleClick}
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/shop") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/shop") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <ShoppingBag className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Магазин</span>
          </div>
        </Link>

        <Link
          to="/tasks"
          onClick={handleClick}
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/tasks") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/tasks") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Target className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Задания</span>
          </div>
        </Link>

        <Link
          to="/rating"
          onClick={handleClick}
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/rating") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/rating") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Trophy className="w-6 h-6 transition-colors duration-200" />
            <span className="text-[12px] font-medium transition-colors duration-200">Рейтинг</span>
          </div>
        </Link>

        <Link
          to="/profile"
          onClick={handleClick}
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/profile") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
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

