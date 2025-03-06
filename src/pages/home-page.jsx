"use client"

import { useState, useEffect } from "react"
import { MiningRewards } from "../components/mining-rewards.jsx"
import { MiningPools } from "../components/mining-pools.jsx"
import { Statistics } from "../components/statistics"
import { MyMiners } from "../components/my-miners"
import { MiningChart } from "../components/mining-chart"
import { createMiningService } from "../services/mining-service"
// Добавьте импорты новых компонентов в начало файла
import { MinerPassInfo } from "../components/miner-pass-info.jsx"

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

  // Обработчик сбора наград
  const handleRewardCollected = (amount, newBalance) => {
    // Обновляем статистику майнинга
    if (miningStats) {
      const updatedStats = { ...miningStats }

      // Добавляем новую запись в историю
      const today = new Date().toISOString().split("T")[0]
      const todayIndex = updatedStats.history.findIndex((item) => item.date === today)

      if (todayIndex >= 0) {
        updatedStats.history[todayIndex].amount += amount
      } else {
        updatedStats.history.push({
          date: today,
          amount,
        })
      }

      setMiningStats(updatedStats)

      // Обновляем данные графика
      const chartLabels = updatedStats.history.map((item) => {
        const date = new Date(item.date)
        return `${date.getDate()}/${date.getMonth() + 1}`
      })

      const chartValues = updatedStats.history.map((item) => item.amount)

      setChartData({
        data: chartValues,
        labels: chartLabels,
      })
    }
  }

  // Обработчик смены пула
  const handlePoolChanged = (poolName) => {
    console.log(`Пул изменен на: ${poolName}`)
    // Здесь можно обновить данные пользователя, если нужно
  }

  return (
    <div className="home-page">
      <div className="app-container">
        <div className="background-gradient"></div>
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>

        {/* Блок сбора наград */}
        <MiningRewards user={user} onRewardCollected={handleRewardCollected} />

        {/* График майнинга */}
        {chartData.data.length > 0 && <MiningChart data={chartData.data} labels={chartData.labels} />}

        {/* Блок статистики */}
        <Statistics minersData={minersData} miningStats={miningStats} />

        {/* Блок информации о Miner Pass */}
        <MinerPassInfo userId={user?.id} hasMinerPass={user?.has_miner_pass} />

        {/* Блок пулов майнинга - используем обычный компонент, чтобы избежать ошибок */}
        <MiningPools user={user} onPoolChanged={handlePoolChanged} />

        {/* Блок майнеров */}
        <MyMiners miners={minersData?.miners || []} />
      </div>
    </div>
  )
}

export default HomePage

