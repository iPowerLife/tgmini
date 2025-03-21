"use client"

import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function BottomMenu() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Функция для сброса прокрутки при клике на пункт меню
  const handleNavClick = () => {
    console.log("Клик по меню, сбрасываем прокрутку")

    // Находим контейнер с прокруткой
    const container = document.querySelector(".page-container")
    if (container) {
      // Сбрасываем прокрутку
      container.scrollTop = 0
    }
  }

  return (
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
  )
}

