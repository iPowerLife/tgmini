"use client"

import { useState, useEffect } from "react"
import { Statistics } from "../components/statistics"
import { MyMiners } from "../components/my-miners"
import { MiningChart } from "../components/mining-chart"
import { createMiningService } from "../services/mining-service"
import { Shield, Check, AlertCircle } from "lucide-react"

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
  const [miningStats, setMiningStats] = useState(null)
  const [chartData, setChartData] = useState({ data: [], labels: [] })

  // Загрузка статистики майнинга
  useEffect(() => {
    if (!user?.id) return

    const loadMiningStats = async () => {
      const service = await createMiningService(user.id)
      const stats = await service.getMiningStats()

      if (stats) {
        setMiningStats(stats)

        // Подготавливаем данные для графика
        const chartLabels = stats.history.map((item) => {
          const date = new Date(item.date)
          return `${date.getDate()}/${date.getMonth() + 1}`
        })

        const chartValues = stats.history.map((item) => item.amount)

        setChartData({
          data: chartValues,
          labels: chartLabels,
        })
      }
    }

    loadMiningStats()
  }, [user?.id])

  return (
    <div className="home-page">
      <div className="app-container">
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        {/* График майнинга */}
        {chartData.data.length > 0 && <MiningChart data={chartData.data} labels={chartData.labels} />}

        {/* Блок статистики */}
        <Statistics minersData={minersData} miningStats={miningStats} />

        {/* Блок информации о Miner Pass */}
        <MinerPassInfo userId={user?.id} hasMinerPass={user?.has_miner_pass} />

        {/* Блок майнеров */}
        <MyMiners miners={minersData?.miners || []} />
      </div>
    </div>
  )
}

export default HomePage

