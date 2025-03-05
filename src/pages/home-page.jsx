"use client"

// Удалим импорт функций из ranks.js
// import { getUserRank, getNextRankInfo } from "../config/ranks"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Добавим функции для работы с рангами
const getUserRank = (balance, ranks) => {
  if (!ranks || ranks.length === 0) {
    return { name: "Новичок", min_balance: 0, color: "#94a3b8" }
  }

  // Находим самый высокий ранг, которому соответствует баланс
  let userRank = ranks[0] // По умолчанию - первый ранг

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (balance >= ranks[i].min_balance) {
      userRank = ranks[i]
      break
    }
  }

  return userRank
}

const getNextRankInfo = (balance, ranks) => {
  if (!ranks || ranks.length === 0) {
    return {
      currentRank: { name: "Новичок", min_balance: 0, color: "#94a3b8" },
      nextRank: null,
      progress: 0,
      nextRankDifference: 100,
    }
  }

  const currentRank = getUserRank(balance, ranks)
  const currentRankIndex = ranks.findIndex((rank) => rank.id === currentRank.id)

  // Если пользователь уже на максимальном ранге
  if (currentRankIndex === ranks.length - 1) {
    return {
      currentRank,
      nextRank: null,
      progress: 100,
      nextRankDifference: 0,
    }
  }

  const nextRank = ranks[currentRankIndex + 1]
  const totalNeeded = nextRank.min_balance - currentRank.min_balance
  const currentProgress = balance - currentRank.min_balance
  const progress = Math.min(100, Math.floor((currentProgress / totalNeeded) * 100))
  const nextRankDifference = nextRank.min_balance - balance

  return {
    currentRank,
    nextRank,
    progress,
    nextRankDifference,
  }
}

// Обновим компонент HomePage, чтобы принимать ranksData
const HomePage = ({ user, balance, minersData, ratingData, transactionsData, ranksData }) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    balance: balance || 0,
    power: minersData?.totalPower || 0,
    stats: [
      { label: "Заработано", value: "0" },
      { label: "Майнеров", value: (minersData?.miners?.length || 0).toString() },
      { label: "Рефералов", value: "0" },
      { label: "Дней", value: "0" },
    ],
    miners: [],
    transactions: [],
    ranking: {
      position: 0,
      currentRank: { name: "Новичок", color: "#94a3b8" },
      nextRank: null,
      progress: 0,
      nextRankDifference: 100,
    },
    referrals: {
      count: 0,
      earned: 0,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Обновляем данные при изменении пропсов
  useEffect(() => {
    if (user && balance !== undefined && minersData && ranksData?.ranks) {
      console.log("Updating home page data from props:", { user, balance, minersData, ranksData })

      // Получаем информацию о ранге из базы данных
      const rankInfo = getNextRankInfo(balance, ranksData.ranks)

      // Форматируем майнеры
      const formattedMiners = (minersData.miners || []).map((miner) => ({
        name: miner.model?.display_name || "Майнер",
        level: miner.level || 1,
        power: miner.model?.mining_power * miner.quantity || 0,
        earnings: `+${((miner.model?.mining_power * miner.quantity || 0) * 0.5).toFixed(1)}`,
      }))

      // Обновляем состояние
      setUserData((prev) => ({
        ...prev,
        balance: balance,
        power: minersData.totalPower || 0,
        stats: [
          { label: "Заработано", value: user.total_earned?.toFixed(0) || "0" },
          { label: "Майнеров", value: (minersData.miners?.length || 0).toString() },
          { label: "Рефералов", value: prev.referrals.count.toString() },
          {
            label: "Дней",
            value: Math.floor(
              (Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24),
            ).toString(),
          },
        ],
        miners: formattedMiners,
        ranking: {
          ...rankInfo,
          position: prev.ranking.position,
        },
      }))
    }
  }, [user, balance, minersData, ranksData])

  // Имитация обновления баланса
  useEffect(() => {
    const interval = setInterval(() => {
      setUserData((prev) => {
        const newBalance = prev.balance + prev.power / 3600 // Увеличиваем баланс каждую секунду
        // Обновляем информацию о ранге при изменении баланса
        const rankInfo = ranksData?.ranks ? getNextRankInfo(newBalance, ranksData.ranks) : prev.ranking

        return {
          ...prev,
          balance: newBalance,
          ranking: {
            ...rankInfo,
            position: prev.ranking.position,
          },
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [ranksData])

  // Остальной код компонента остается без изменений
}

