"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ReferralSection } from "./referral-section"
import { Settings, User } from "lucide-react"

export const ProfileSection = ({ user }) => {
  const [showSettings, setShowSettings] = useState(false)

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("ru-RU").format(balance || 0)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Основная информация */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700"
      >
        {/* Декоративный фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-2 border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{user.username || "Пользователь"}</h1>
                <p className="text-sm text-gray-400">ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/10">
              <div className="text-sm text-gray-400 mb-1">Баланс</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {formatBalance(user.balance)} <span className="text-xl">💎</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/10">
              <div className="text-sm text-gray-400 mb-1">Уровень</div>
              <div className="text-2xl font-bold text-white">{user.level || 1}</div>
            </div>
          </div>

          {/* Прогресс уровня */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Прогресс уровня</span>
              <span className="text-gray-400">75%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Секция достижений */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Достижения</h2>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 flex items-center justify-center"
            >
              <span className="text-2xl">🔒</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Реферальная секция */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700 p-6"
      >
        <ReferralSection user={user} />
      </motion.div>
    </div>
  )
}

