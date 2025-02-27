"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import { Pickaxe, Cpu, Trophy, Coins, ChevronRight } from "lucide-react"
import { Progress } from "../components/ui/progress"
import { supabase } from "../lib/supabase"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Регистрируем компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Home() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-web-app.js"
    script.async = true
    script.onload = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()
        loadData(tg.initDataUnsafe)
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const loadData = async (initDataUnsafe) => {
    try {
      if (!initDataUnsafe?.user?.id) {
        throw new Error("No Telegram user ID found")
      }

      // Загружаем данные пользователя
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", initDataUnsafe.user.id)
        .single()

      if (userError) throw userError
      setUser(userData)

      // Загружаем транзакции
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (txError) throw txError
      setTransactions(txData)

      // Загружаем майнеры пользователя
      const { data: minersData, error: minersError } = await supabase
        .from("user_miners")
        .select(`
          quantity,
          miners (
            name,
            power,
            price,
            description
          )
        `)
        .eq("user_id", userData.id)

      if (minersError) throw minersError
      setMiners(minersData)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Подготовка данных для графика
  const chartData = {
    labels: transactions.map((tx) => new Date(tx.created_at).toLocaleDateString()),
    datasets: [
      {
        label: "Баланс",
        data: transactions.map((tx) => tx.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "История транзакций",
        color: "white",
      },
    },
    scales: {
      y: {
        ticks: { color: "white" },
      },
      x: {
        ticks: { color: "white" },
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 max-w-md">
          <p className="text-red-500">Ошибка: {error}</p>
        </div>
      </div>
    )
  }

  // Расчет прогресса до следующего уровня
  const levelProgress = ((user?.experience || 0) / (user?.next_level_exp || 100)) * 100

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Приветствие */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Привет, {user?.username}! 👋</h1>
          <p className="text-gray-400">Уровень {user?.level || 1}</p>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-400">Баланс</span>
            </div>
            <p className="text-2xl font-bold">{user?.balance?.toFixed(2)} 💰</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400">Мощность</span>
            </div>
            <p className="text-2xl font-bold">{user?.mining_power?.toFixed(2)} ⚡</p>
          </div>
        </div>

        {/* Прогресс уровня */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Прогресс уровня</span>
            </div>
            <span className="text-sm text-gray-400">
              {user?.experience || 0} / {user?.next_level_exp || 100} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>

        {/* Майнеры */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Pickaxe className="w-5 h-5" />
            Ваши майнеры
          </h2>
          <div className="space-y-4">
            {miners.map((miner, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-bold">{miner.miners.name}</p>
                  <p className="text-sm text-gray-400">
                    Мощность: {miner.miners.power} ⚡ × {miner.quantity}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
            {miners.length === 0 && (
              <p className="text-gray-400 text-center">
                У вас пока нет майнеров. Используйте команду /shop в боте для покупки.
              </p>
            )}
          </div>
        </div>

        {/* График транзакций */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">История майнинга</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

