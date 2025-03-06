"use client"

import { useState } from "react"
import { MiningChart } from "../components/mining-chart"
import { MyMiners } from "../components/my-miners"
import { Shield, Check, AlertCircle, TrendingUp } from "lucide-react"

// Встроенный компонент MinerPassInfo
const MinerPassInfo = ({ userId, hasMinerPass }) => {
  const [loading, setLoading] = useState(false)

  // Если пользователь не имеет Miner Pass, показываем информацию о преимуществах
  if (!hasMinerPass) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Shield className="text-yellow-500" size={20} />
            <span className="font-medium">Miner Pass</span>
          </div>
          <span className="text-sm text-gray-400">Недоступно</span>
        </div>

        <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-yellow-500/90">
              Приобретите Miner Pass в магазине, чтобы получить дополнительные преимущества и снять ограничения на
              покупку майнеров.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Снятие лимитов на покупку майнеров</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Бонус +10% к хешрейту всех майнеров</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <Check size={12} className="text-gray-500" />
            </div>
            <span>Ежедневные бонусы и награды</span>
          </div>
        </div>
      </div>
    )
  }

  // Если у пользователя есть Miner Pass, показываем информацию о нем
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Shield className="text-yellow-500" size={20} />
          <span className="font-medium">Miner Pass</span>
        </div>
        <span className="text-sm text-green-500">Активен</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Лимиты на покупку майнеров сняты</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Бонус +10% к хешрейту активен</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check size={12} className="text-yellow-500" />
          </div>
          <span>Ежедневные бонусы доступны</span>
        </div>
      </div>
    </div>
  )
}

// Обновленная главная страница
const HomePage = ({ user, balance, minersData, ratingData, transactionsData, ranksData }) => {
  // Используем статические данные для графика вместо загрузки из сервиса
  const [chartData] = useState({
    data: [10, 15, 20, 18, 25, 30, 28, 35],
    labels: ["1/6", "2/6", "3/6", "4/6", "5/6", "6/6", "7/6", "8/6"],
  })

  // Создаем объект с данными статистики майнинга
  // В будущем эти данные могут приходить из API
  const miningStats = {
    dailyAverage: Math.round((chartData.data.reduce((sum, val) => sum + val, 0) / chartData.data.length) * 1.2),
    totalMined: chartData.data.reduce((sum, val) => sum + val, 0) * 3,
    totalTime: "14д 6ч",
    // Другие статистические данные...
  }

  return (
    <div className="home-page">
      <div className="app-container">
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        {/* Информация о балансе */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-4">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-400 text-sm">Баланс</div>
              <div className="text-xl font-bold">{balance.toFixed(2)} 💎</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Позиция в рейтинге</div>
              <div className="text-xl font-bold flex items-center justify-end">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                {ratingData?.users?.findIndex((u) => u.id === user?.id) + 1 || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* График майнинга */}
        <MiningChart data={chartData.data} labels={chartData.labels} />

        {/* Блок информации о Miner Pass */}
        <MinerPassInfo userId={user?.id} hasMinerPass={user?.has_miner_pass} />

        {/* Статистика майнинга и список майнеров */}
        <MyMiners miners={minersData?.miners || []} miningStats={miningStats} />
      </div>
    </div>
  )
}

export default HomePage

