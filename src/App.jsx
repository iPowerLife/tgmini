;("use client")

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import Shop from "./components/shop"
import { useMinerPass } from "./hooks/useMinerPass"
import React from "react"
import LoadingScreen from "./components/loading-screen"
// Импортируем только TasksPage
import TasksPage from "./pages/tasks"
import { RatingSection } from "./components/rating-section"
import { UserProfile } from "./components/user-profile"
import { createMockTasks } from "./utils/mock-data" // Импортируем функцию для создания тестовых заданий
// Добавьте импорт функции предзагрузки изображений в начало файла
import { preloadImages } from "./utils/image-preloader"

// Простой компонент для уведомлений
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`
fixed
top - 4
right - 4
p - 4
rounded - lg
shadow - lg
$
{
  type === "error" ? "bg-red-500" : "bg-green-500"
}
text - white
max - w - xs
z-50`}
    >
      \
      <div className="flex justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 font-bold">
          &times;
        </button>
      </div>
    </div>
  )
}

// Контекст для уведомлений
const ToastContext = React.createContext({
  showToast: () => {},
})

// Компонент для отображения во время загрузки
const LoadingFallback = () => (
  <div className="section-container">
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  </div>
)

// Компонент для сброса прокрутки при изменении маршрута
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Находим контейнер с прокруткой
    const container = document.querySelector(".page-container")
    if (container) {
      // Сбрасываем прокрутку
      container.scrollTop = 0
      console.log("Сброс прокрутки при переходе на:", pathname)
    }
  }, [pathname])

  return null
}

// В функции AppContent добавим tasksData в параметры
function AppContent({
  user,
  balance,
  handleBalanceUpdate,
  shopData,
  minersData,
  tasksData, // Добавляем tasksData
  handleTaskComplete,
  ratingData,
  transactionsData,
  ranksData,
  hasMinerPass,
  cachedMiningInfo,
  onCacheUpdate,
}) {
  console.log("AppContent rendered with:", { user, balance, minersData, ratingData, ranksData, hasMinerPass })

  // В начале функции AppContent добавьте:
  const [toast, setToast] = useState(null)

  // Функция для показа уведомлений
  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="root-container">
        <ScrollToTop />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Единственный скроллируемый контейнер */}
        <div className="page-container">
          <Routes>
            <Route
              path="/"
              element={
                <div className="page-content" key="home-page">
                  <HomePage
                    user={{ ...user, has_miner_pass: hasMinerPass }}
                    balance={balance}
                    minersData={minersData}
                    ratingData={ratingData}
                    transactionsData={transactionsData}
                    ranksData={ranksData}
                    onPurchase={handleBalanceUpdate}
                    cachedMiningInfo={cachedMiningInfo}
                    onCacheUpdate={onCacheUpdate}
                  />
                </div>
              }
            />
            <Route
              path="/miners"
              element={
                <div className="page-content" key="miners-page">
                  <div className="balance-card">
                    <div className="balance-background" />
                    <div className="balance-content">
                      <div className="balance-label">Баланс</div>
                      <div className="balance-amount">
                        <span>{balance.toFixed(2)}</span>
                        <span className="balance-currency">💎</span>
                      </div>
                    </div>
                  </div>
                  <MinersList miners={minersData.miners} totalPower={minersData.totalPower} />
                </div>
              }
            />
            <Route
              path="/shop"
              element={
                <div className="page-content" key="shop-page">
                  <Shop
                    user={user}
                    onPurchase={handleBalanceUpdate}
                    categories={shopData.categories}
                    models={shopData.models}
                    hasMinerPass={hasMinerPass}
                  />
                </div>
              }
            />
            <Route
              path="/tasks"
              element={
                <div className="page-content" key="tasks-page">
                  <TasksPage
                    user={user}
                    onBalanceUpdate={handleBalanceUpdate}
                    onTaskComplete={handleTaskComplete}
                    tasks={tasksData.tasks} // Передаем предзагруженные задания
                    isLoading={tasksData.loading} // Передаем статус загрузки
                  />
                </div>
              }
            />
            <Route
              path="/rating"
              element={
                <div className="page-content" key="rating-page">
                  <RatingSection currentUserId={user?.id} users={ratingData.users} />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="page-content" key="profile-page">
                  <UserProfile user={user} miners={minersData.miners} totalPower={minersData.totalPower} />
                </div>
              }
            />
          </Routes>
        </div>

        {/* Фиксированное нижнее меню */}
        <div className="fixed-bottom-menu">
          <BottomMenu />
        </div>
      </div>
    </ToastContext.Provider>
  )
}

function App() {
  // Существующие состояния и хуки остаются без изменений
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Новое состояние для загрузочного экрана
  const [showSplash, setShowSplash] = useState(true)
  // Добавьте новый шаг загрузки в состояние loadingSteps
  const [loadingSteps, setLoadingSteps] = useState({
    database: "pending",
    user: "pending",
    miners: "pending",
    mining: "pending",
    tasks: "pending",
    images: "pending", // Добавляем шаг загрузки изображений
  })
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Состояния для данных
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState({ miners: [], totalPower: 0 })
  const [tasksData, setTasksData] = useState({ tasks: [], loading: true }) // Добавляем статус загрузки
  const [ratingData, setRatingData] = useState({ users: [] })
  const [transactionsData, setTransactionsData] = useState({ transactions: [] })
  // Добавим новое состояние для рангов и функцию их загрузки
  const [ranksData, setRanksData] = useState({ ranks: [] })

  // Добавьте новое состояние для кэширования данных о майнинге
  const [cachedMiningInfo, setCachedMiningInfo] = useState(null)

  // Добавьте хук для проверки Miner Pass
  const { hasMinerPass } = useMinerPass(user?.id)

  // Функция для обновления прогресса загрузки
  const updateLoadingProgress = useCallback((step, status, progressIncrement = 0) => {
    setLoadingSteps((prev) => ({ ...prev, [step]: status }))
    if (progressIncrement > 0) {
      setLoadingProgress((prev) => Math.min(100, prev + progressIncrement))
    }
  }, [])

  // Загрузка данных магазина
  const loadShopData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading shop data...")
      updateLoadingProgress("miners", "loading")

      const [categoriesResponse, modelsResponse] = await Promise.all([
        supabase.from("miner_categories").select("*").order("id"),
        supabase.from("miner_models").select("*").order("category_id, price"),
      ])

      if (categoriesResponse.error) throw categoriesResponse.error
      if (modelsResponse.error) throw modelsResponse.error

      setShopData({
        categories: categoriesResponse.data || [],
        models: modelsResponse.data || [],
      })
      console.log("Shop data loaded successfully")
      updateLoadingProgress("miners", "complete", 15)
    } catch (error) {
      console.error("Error loading shop data:", error)
      updateLoadingProgress("miners", "error")
    }
  }, [user?.id, updateLoadingProgress])

  // Загрузка данных майнеров
  const loadMinersData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading miners data...")

      const { data, error } = await supabase
        .from("user_miners")
        .select(`
    *,
    model:miner_models (
      id,
      name,
      display_name,
      mining_power,
      energy_consumption
    )
  `)
        .eq("user_id", user.id)
        .order("purchased_at")

      if (error) throw error

      const totalPower = (data || []).reduce((sum, miner) => sum + miner.model.mining_power * miner.quantity, 0)
      setMinersData({ miners: data || [], totalPower })
      console.log("Miners data loaded successfully")
    } catch (error) {
      console.error("Error loading miners data:", error)
    }
  }, [user?.id])

  // Загрузка данных заданий - обновляем для предзагрузки
  const loadTasksData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading tasks data...")
      updateLoadingProgress("tasks", "loading")
      setTasksData((prev) => ({ ...prev, loading: true }))

      // Получаем задания
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(`
          *,
          category:task_categories(name, display_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (tasksError) throw tasksError

      let tasks = []
      if (tasksData && tasksData.length > 0) {
        tasks = tasksData
      } else {
        // Если заданий нет, создаем тестовые
        tasks = createMockTasks()
      }

      setTasksData({ tasks, loading: false })
      console.log("Tasks data loaded successfully")
      updateLoadingProgress("tasks", "complete", 15)
    } catch (error) {
      console.error("Error loading tasks data:", error)
      // Создаем тестовые данные при ошибке
      setTasksData({ tasks: createMockTasks(), loading: false })
      updateLoadingProgress("tasks", "error")
    }
  }, [user?.id, updateLoadingProgress])

  // Загрузка данных рейтинга
  const loadRatingData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading rating data...")

      const { data, error } = await supabase.rpc("get_users_rating")

      if (error) throw error

      setRatingData({ users: data || [] })
      console.log("Rating data loaded successfully")
    } catch (error) {
      console.error("Error loading rating data:", error)
    }
  }, [user?.id])

  // Загрузка данных транзакций
  const loadTransactionsData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading transactions data...")

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      // Форматируем транзакции
      const formattedTransactions = (data || []).map((tx) => ({
        id: tx.id,
        description:
          tx.description ||
          (tx.type === "mining"
            ? "Майнинг"
            : tx.type === "purchase"
              ? "Покупка майнера"
              : tx.type === "referral_reward"
                ? "Реферальная награда"
                : tx.type === "referral_bonus"
                  ? "Реферальный бонус"
                  : "Транзакция"),
        amount: tx.amount,
        timestamp: new Date(tx.created_at).getTime(),
        type: tx.type,
      }))

      setTransactionsData({ transactions: formattedTransactions })
      console.log("Transactions data loaded successfully")
    } catch (error) {
      console.error("Error loading transactions data:", error)
    }
  }, [user?.id])

  // Добавим функцию загрузки рангов
  const loadRanksData = useCallback(async () => {
    try {
      console.log("Loading ranks data...")

      const { data, error } = await supabase.from("ranks").select("*").order("min_balance")

      if (error) throw error

      setRanksData({ ranks: data || [] })
      console.log("Ranks data loaded successfully")
    } catch (error) {
      console.error("Error loading ranks data:", error)
    }
  }, [])

  // Добавляем предварительную загрузку данных для главной страницы
  const preloadMiningData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Preloading mining data...")
      updateLoadingProgress("mining", "loading")

      // Проверяем, есть ли уже кэшированные данные
      if (cachedMiningInfo) {
        console.log("Using existing cached mining data")
        updateLoadingProgress("mining", "complete", 15)
        return
      }

      // Загружаем данные о майнинге и пулах параллельно
      const [miningInfoResponse, poolsResponse] = await Promise.all([
        supabase.rpc("get_mining_info_with_rewards", {
          user_id_param: user.id,
        }),
        supabase.from("mining_pools").select("*").order("min_miners"),
      ])

      if (miningInfoResponse.error) throw miningInfoResponse.error
      if (poolsResponse.error) throw poolsResponse.error

      // Добавляем данные о пулах в кэшированную информацию
      const combinedData = {
        ...miningInfoResponse.data,
        mining_pools: poolsResponse.data || [],
      }

      setCachedMiningInfo(combinedData)
      console.log("Mining data preloaded successfully with pools:", combinedData)
      updateLoadingProgress("mining", "complete", 15)
    } catch (error) {
      console.error("Error preloading mining data:", error)
      updateLoadingProgress("mining", "error")
    }
  }, [user?.id, cachedMiningInfo, updateLoadingProgress])

  // Добавьте новую функцию для предзагрузки изображений после функции preloadMiningData
  const preloadShopImages = useCallback(async () => {
    if (!shopData.models || shopData.models.length === 0) return

    try {
      console.log("Preloading shop images...")
      updateLoadingProgress("images", "loading")

      // Собираем все URL изображений из моделей магазина
      const imageUrls = shopData.models.map((model) => model.image_url).filter((url) => url && url.trim() !== "")

      // Предзагружаем изображения
      await preloadImages(imageUrls, (progress) => {
        // Обновляем прогресс загрузки (максимум 10%)
        const progressIncrement = Math.floor(progress * 10)
        if (progressIncrement > 0) {
          updateLoadingProgress("images", "loading", progressIncrement)
        }
      })

      console.log("Shop images preloaded successfully")
      updateLoadingProgress("images", "complete", 5)
    } catch (error) {
      console.error("Error preloading shop images:", error)
      updateLoadingProgress("images", "error")
    }
  }, [shopData.models, updateLoadingProgress])

  // Добавляем новую функцию для предзагрузки изображений заданий
  const preloadTaskImages = useCallback(async () => {
    if (!tasksData.tasks || tasksData.tasks.length === 0) return

    try {
      console.log("Preloading task images...")
      updateLoadingProgress("images", "loading")

      // Собираем все URL изображений из заданий
      const imageUrls = tasksData.tasks.map((task) => task.icon_url).filter((url) => url && url.trim() !== "")

      // Предзагружаем изображения
      await preloadImages(imageUrls, (progress) => {
        // Обновляем прогресс загрузки (максимум 5%)
        const progressIncrement = Math.floor(progress * 5)
        if (progressIncrement > 0) {
          updateLoadingProgress("images", "loading", progressIncrement)
        }
      })

      console.log("Task images preloaded successfully")
      updateLoadingProgress("images", "complete", 5)
    } catch (error) {
      console.error("Error preloading task images:", error)
      updateLoadingProgress("images", "error")
    }
  }, [tasksData.tasks, updateLoadingProgress])

  // Добавьте функцию для обновления кэша
  const updateMiningInfoCache = useCallback((data) => {
    console.log("Updating mining info cache:", data)
    setCachedMiningInfo(data)
  }, [])

  // Инициализация приложения
  useEffect(() => {
    let mounted = true

    const initApp = async () => {
      try {
        setLoading(true)
        setError(null)
        setLoadingProgress(5) // Начальный прогресс

        console.log("Initializing app...")
        updateLoadingProgress("database", "loading")

        const telegram = initTelegram()
        console.log("Telegram WebApp status:", telegram ? "доступен" : "недоступен")

        // Проверяем подключение к базе данных
        try {
          const { data: healthCheck, error: healthError } = await supabase.from("health_check").select("*").limit(1)
          if (healthError) {
            console.warn("Health check table not found, but connection is working")
          }
        } catch (error) {
          console.warn("Health check failed, but continuing:", error)
        }

        updateLoadingProgress("database", "complete", 10)
        setLoadingProgress(15) // Прогресс после подключения к БД

        updateLoadingProgress("user", "loading")
        const userData = getTelegramUser()
        console.log("User data:", userData)

        // Обработка реферальной ссылки
        const handleReferral = async (telegramUser) => {
          try {
            // Получаем параметр startapp
            const startParam = window.Telegram?.

