"use client"

import React from "react"
import { createClient } from "@supabase/supabase-js"
import { Line } from "react-chartjs-2"
import { Pickaxe, Cpu, Trophy, Coins } from "lucide-react"
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Создаем клиент Supabase
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// Компонент прогресс-бара
function Progress({ value, className = "" }) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-700 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-blue-500 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
}

// Основной компонент приложения
function App() {
  const [user, setUser] = React.useState(null)
  const [transactions, setTransactions] = React.useState([])
  const [miners, setMiners] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [telegramWebApp, setTelegramWebApp] = React.useState(null)

  React.useEffect(() => {
    // Подключаем Telegram WebApp
    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp already available")
      const tg = window.Telegram.WebApp
      setTelegramWebApp(tg)
      tg.ready()
      tg.expand()
      loadData(tg.initDataUnsafe)
    } else {
      console.log("Loading Telegram WebApp script...")
      const script = document.createElement("script")
      script.src = "https://telegram.org/js/telegram-web-app.js"
      script.async = true
      script.onload = () => {
        console.log("Telegram WebApp script loaded")
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          setTelegramWebApp(tg)
          tg.ready()
          tg.expand()
          loadData(tg.initDataUnsafe)
        } else {
          console.error("Telegram WebApp not available after script load")
          setError("Не удалось инициализировать Telegram WebApp")
          setLoading(false)
        }
      }
      script.onerror = () => {
        console.error("Failed to load Telegram WebApp script")
        setError("Не удалось загрузить Telegram WebApp")
        setLoading(false)
      }
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Загрузка данных пользователя
  async function loadData(initDataUnsafe) {
    try {
      console.log("Loading data with initDataUnsafe:", initDataUnsafe)

      if (!initDataUnsafe?.user?.id) {
        console.error("No user ID in initDataUnsafe:", initDataUnsafe)
        throw new Error("Не найден ID пользователя Telegram")
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", initDataUnsafe.user.id)
        .single()

      if (userError) {
        console.error("Supabase user error:", userError)
        throw userError
      }

      console.log("User data loaded:", userData)
      setUser(userData)

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (txError) {
        console.error("Supabase transactions error:", txError)
        throw txError
      }

      console.log("Transactions loaded:", txData)
      setTransactions(txData)

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

      if (minersError) {
        console.error("Supabase miners error:", minersError)
        throw minersError
      }

      console.log("Miners loaded:", minersData)
      setMiners(minersData || [])
    } catch (err) {
      console.error("Error in loadData:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Добавляем отладочную информацию в UI
  if (!telegramWebApp) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500 rounded-lg p-4">
          <h1 className="text-xl font-bold mb-2">Ошибка инициализации</h1>
          <p className="text-red-500">Telegram WebApp не доступен</p>
          <p className="text-sm text-gray-400 mt-2">Пожалуйста, убедитесь что вы открыли приложение через Telegram</p>
        </div>
      </div>
    )
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
          <h1 className="text-xl font-bold mb-2">Ошибка</h1>
          <p className="text-red-500">{error}</p>
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <p className="text-gray-400">Отладочная информация:</p>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(telegramWebApp?.initDataUnsafe, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )
  }

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

  const levelProgress = ((user?.experience || 0) / (user?.next_level_exp || 100)) * 100

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Привет, {user?.username}! 👋</h1>
          <p className="text-gray-400">Уровень {user?.level || 1}</p>
        </div>

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

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Pickaxe className="w-5 h-5" />
            Ваши майнеры
          </h2>
          <div className="space-y-4">
            {miners.map((miner, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded-lg">
                <p className="font-bold">{miner.miners.name}</p>
                <p className="text-sm text-gray-400">
                  Мощность: {miner.miners.power} ⚡ × {miner.quantity}
                </p>
              </div>
            ))}
            {miners.length === 0 && (
              <p className="text-gray-400 text-center">
                У вас пока нет майнеров. Используйте команду /shop в боте для покупки.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">История майнинга</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Отладочная информация */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-xs">
          <p className="text-gray-400 mb-2">Отладочная информация:</p>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(
              {
                initData: telegramWebApp?.initData,
                initDataUnsafe: telegramWebApp?.initDataUnsafe,
                version: telegramWebApp?.version,
                platform: telegramWebApp?.platform,
                colorScheme: telegramWebApp?.colorScheme,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App

