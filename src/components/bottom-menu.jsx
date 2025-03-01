"use client"

import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomMenu() {
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-gray-900/95 backdrop-blur-sm border-t border-gray-800/50">
      <nav className="flex items-center justify-around h-14 max-w-md mx-auto px-4">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Home className="w-5 h-5 transition-colors duration-200" />
            <span className="text-[11px] font-medium transition-colors duration-200">Главная</span>
          </div>
        </Link>

        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/shop") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/shop") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <ShoppingBag className="w-5 h-5 transition-colors duration-200" />
            <span className="text-[11px] font-medium transition-colors duration-200">Магазин</span>
          </div>
        </Link>

        <Link
          href="/tasks"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/tasks") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/tasks") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Target className="w-5 h-5 transition-colors duration-200" />
            <span className="text-[11px] font-medium transition-colors duration-200">Задания</span>
          </div>
        </Link>

        <Link
          href="/rating"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/rating") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/rating") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <Trophy className="w-5 h-5 transition-colors duration-200" />
            <span className="text-[11px] font-medium transition-colors duration-200">Рейтинг</span>
          </div>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center space-y-1 relative group ${
            isActive("/profile") ? "text-blue-400" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          {isActive("/profile") && <div className="absolute inset-0 bg-blue-400/5 rounded-xl blur-md" />}
          <div className="relative flex flex-col items-center">
            <User className="w-5 h-5 transition-colors duration-200" />
            <span className="text-[11px] font-medium transition-colors duration-200">Профиль</span>
          </div>
        </Link>
      </nav>
    </div>
  )
}

