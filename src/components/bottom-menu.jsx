"use client"

import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function BottomMenu() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
      <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/") ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {isActive("/") && <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur-md" />}
          <div className="relative">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Главная</span>
          </div>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/shop") ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {isActive("/shop") && <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur-md" />}
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-medium">Магазин</span>
          </div>
        </Link>

        <Link
          to="/tasks"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/tasks") ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {isActive("/tasks") && <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur-md" />}
          <div className="relative">
            <Target className="w-5 h-5" />
            <span className="text-xs font-medium">Задания</span>
          </div>
        </Link>

        <Link
          to="/rating"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/rating") ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {isActive("/rating") && <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur-md" />}
          <div className="relative">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-medium">Рейтинг</span>
          </div>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/profile") ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {isActive("/profile") && <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur-md" />}
          <div className="relative">
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Профиль</span>
          </div>
        </Link>
      </nav>
    </div>
  )
}

