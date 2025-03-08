"use client"

import { Home, ShoppingCart, Award, BarChart2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function BottomMenu({ active }) {
  const navigate = useNavigate()

  const handleNavigate = (path) => {
    navigate(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1F2E] border-t border-[#2A3142]/50 shadow-lg backdrop-blur-md z-50">
      <div className="flex justify-around items-center py-2 px-1">
        <button
          onClick={() => handleNavigate("/")}
          className={`flex flex-col items-center justify-center p-2 ${
            active === "home" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Главная</span>
        </button>

        <button
          onClick={() => handleNavigate("/shop")}
          className={`flex flex-col items-center justify-center p-2 ${
            active === "shop" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs mt-1">Магазин</span>
        </button>

        <button
          onClick={() => handleNavigate("/tasks")}
          className={`flex flex-col items-center justify-center p-2 ${
            active === "earn" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-xs mt-1">Задания</span>
        </button>

        <button
          onClick={() => handleNavigate("/rating")}
          className={`flex flex-col items-center justify-center p-2 ${
            active === "rating" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-xs mt-1">Рейтинг</span>
        </button>

        <button
          onClick={() => handleNavigate("/profile")}
          className={`flex flex-col items-center justify-center p-2 ${
            active === "profile" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Профиль</span>
        </button>
      </div>
    </div>
  )
}

