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

// Компонент отладочной информации
function DebugInfo({ data }) {
  return (
    <div className="debug-info">
      <pre>{JSON.stringify(data, null, 2)}</pre>
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
  const [debugData, setDebugData] = React.useState({
    telegramWebApp: null,
    initData: null,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    stage: "initial",
  })

  React.useEffect(() => {
    // Подключаем Telegram WebApp
    try {
      setDebugData((prev) => ({ ...prev, stage: "loading-script" }))

      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        setDebugData((prev) => ({
          ...prev,
          stage: "webapp-ready",
          telegramWebApp: {
            version: tg.version,
            platform: tg.platform,
            colorScheme: tg.colorScheme,
            themeParams: tg.themeParams,
          },
        }))

        tg.ready()
        tg.expand()

        // Принудительно устанавливаем тёмную тему
        document.documentElement.style.setProperty("--tg-theme-bg-color", "#1a1b1e")
        document.documentElement.style.setProperty("--tg-theme-text-color", "#ffffff")

        loadData(tg.initDataUnsafe)
      } else {
        const script = document.createElement("script")
        script.src = "https://telegram.org/js/telegram-web-app.js"
        script.async = true
        script.onload = () => {
          if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp
            setDebugData((prev) => ({
              ...prev,
              stage: "webapp-loaded",
              telegramWebApp: {
                version: tg.version,
                platform: tg.platform,
                colorScheme: tg.colorScheme,
                themeParams: tg.themeParams,
              },
            }))

            tg.ready()
            tg.expand()
            loadData(tg.initDataUnsafe)
          } else {
            setError("Telegram WebApp не доступен после загрузки скрипта")
            setDebugData((prev) => ({ ...prev, stage: "webapp-load-failed" }))
          }
        }
        document.head.appendChild(script)
      }
    } catch (err) {
      setError(err.message)
      setDebugData((prev) => ({ ...prev, stage: "error", error: err.message }))
    }
  }, [])

  // Загрузка данных пользователя
  async function loadData(initDataUnsafe) {
    try {
      setDebugData((prev) => ({ ...prev, stage: "loading-data", initData: initDataUnsafe }))

      if (!initDataUnsafe?.user?.id) {
        throw new Error("Не найден ID пользователя Telegram")
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", initDataUnsafe.user.id)
        .single()

      if (userError) throw userError
      setUser(userData)
      setDebugData((prev) => ({ ...prev, stage: "user-loaded", userData }))

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (txError) throw txError
      setTransactions(txData)
      setDebugData((prev) => ({ ...prev, stage: "transactions-loaded" }))

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
      setMiners(minersData || [])
      setDebugData((prev) => ({ ...prev, stage: "miners-loaded" }))
    } catch (err) {
      setError(err.message)
      setDebugData((prev) => ({ ...prev, stage: "error", error: err.message }))
    } finally {
      setLoading(false)
      setDebugData((prev) => ({ ...prev, stage: "completed" }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Загрузка...</p>
        </div>
        <DebugInfo data={debugData} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 max-w-md">
          <h1 className="text-xl font-bold mb-2">Ошибка</h1>
          <p className="text-red-500">{error}</p>
        </div>
        <DebugInfo data={debugData} />
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
      </div>
      <DebugInfo data={debugData} />
    </div>
  )
}

export default App

