"use client"

import { useState, useEffect } from "react"
import { MiningChart } from "../components/mining-chart"
import { MyMiners } from "../components/my-miners"
import { Shield, Check, AlertCircle, TrendingUp } from "lucide-react"
import { supabase } from "../utils/supabaseClient"

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
  const [chartData, setChartData] = useState({ data: [], labels: [] })
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка данных для графика
  useEffect(() => {
    const loadMiningHistory = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        // Получаем историю майнинга за последние 8 дней
        const { data: history, error } = await supabase
          .from("mining_history")
          .select("amount, created_at")
          .eq("user_id", user.id)
          .gte("created_at", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: true })

        if (error) throw error

        // Группируем данные по дням
        const dailyData = history.reduce((acc, record) => {
          const date = new Date(record.created_at).toLocaleDateString()
          acc[date] = (acc[date] || 0) + record.amount
          return acc
        }, {})

        // Получаем последние 8 дней
        const last8Days = Array.from({ length: 8 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (7 - i))
          return date.toLocaleDateString()
        })

        // Формируем данные для графика
        const data = last8Days.map((date) => dailyData[date] || 0)
        const labels = last8Days.map((date) => {
          const [day, month] = date.split(".")
          return `${day}/${month}`
        })

        setChartData({ data, labels })
      } catch (error) {
        console.error("Error loading mining history:", error)
        // В случае ошибки показываем примерные данные
        const last8Days = Array.from({ length: 8 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (7 - i))
          return date.toLocaleDateString()
        })
        setChartData({
          data: [10, 15, 20, 18, 25, 30, 28, 35],
          labels: last8Days.map((date) => {
            const [day, month] = date.split(".")
            return `${day}/${month}`
          }),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMiningHistory()
  }, [user?.id])

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

        {/* График майнинга с состоянием загрузки */}
        {isLoading ? (
          <div className="bg-gray-900 rounded-2xl p-4 mb-4 h-[200px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <MiningChart data={chartData.data} labels={chartData.labels} title="Доход от майнинга (💎 в день)" />
        )}

        {/* Блок информации о Miner Pass */}
        <MinerPassInfo userId={user?.id} hasMinerPass={user?.has_miner_pass} />

        {/* Статистика майнинга и список майнеров */}
        <MyMiners miners={minersData?.miners || []} miningStats={miningStats} />
      </div>
    </div>
  )
}

export default HomePage

