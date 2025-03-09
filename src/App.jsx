;("use client")

// Заменяем импорты на оптимизированные версии
import { useState, useEffect, useCallback, useMemo } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { initTelegram } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { supabase } from "./supabase"
import HomePage from "./pages/home-page"
import Shop from "./components/shop"
import { useMinerPass } from "./hooks/useMinerPass"
import React from "react"
import LoadingScreen from "./components/loading-screen"
import TasksPage from "./pages/tasks"
import { RatingSection } from "./components/rating-section"
import { UserProfile } from "./components/user-profile"
import { preloadImages } from "./utils/image-preloader"
// Импортируем новые компоненты и хуки
import { DataPrefetcher } from "./utils/data-prefetcher"
import { useUserData } from "./hooks/use-user-data"
import { clearQueryCache } from "./hooks/use-supabase-query"

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
top-4
right-4
p-4
rounded-lg
shadow-lg
${type === "error" ? "bg-red-500" : "bg-green-500"}
text-white
max-w-xs
z-50`}
    >
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

// Mock data for tasks
const createMockTasks = () => {
  return [
    {
      id: "mock-task-1",
      title: "Follow us on Twitter",
      description: "Follow our official Twitter account to earn rewards.",
      reward: 10,
      category: { name: "social", display_name: "Social" },
      icon_url: "https://abs.twimg.com/favicons/favicon.ico",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-task-2",
      title: "Join our Telegram channel",
      description: "Join our Telegram channel to stay updated.",
      reward: 15,
      category: { name: "social", display_name: "Social" },
      icon_url: "https://telegram.org/img/t_logo.png",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]
}

function App() {
  // Используем оптимизированный хук для получения данных пользователя
  const { user, telegramUser, isLoading: userLoading, updateBalance, error: userError } = useUserData()

  // Состояния для данных
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState({ miners: [], totalPower: 0 })
  const [tasksData, setTasksData] = useState({ tasks: [], loading: true })
  const [ratingData, setRatingData] = useState({ users: [] })
  const [transactionsData, setTransactionsData] = useState({ transactions: [] })
  const [ranksData, setRanksData] = useState({ ranks: [] })
  const [cachedMiningInfo, setCachedMiningInfo] = useState(null)

  // Новое состояние для загрузочного экрана
  const [showSplash, setShowSplash] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState({
    database: "pending",
    user: "pending",
    miners: "pending",
    mining: "pending",
    tasks: "pending",
    images: "pending",
    shop: "pending",
  })
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Добавьте хук для проверки Miner Pass
  const { hasMinerPass } = useMinerPass(user?.id)

  // Инициализация Telegram
  useEffect(() => {
    initTelegram()

    // Очищаем кэш при размонтировании компонента
    return () => {
      clearQueryCache()
    }
  }, [])

  // Обработчик прогресса загрузки данных
  const handleLoadingProgress = useCallback(({ step, progress }) => {
    setLoadingSteps((prev) => ({
      ...prev,
      [step]: step === "complete" ? "complete" : "loading",
    }))

    setLoadingProgress(progress * 100)

    if (step === "complete") {
      // Завершаем все шаги
      setLoadingSteps((prev) => {
        const newSteps = {}
        Object.keys(prev).forEach((key) => {
          newSteps[key] = "complete"
        })
        return newSteps
      })

      // Скрываем загрузочный экран через 1.5 секунды
      setTimeout(() => setShowSplash(false), 1500)
    }
  }, [])

  // Обработчик завершения загрузки данных
  const handleLoadingComplete = useCallback(() => {
    setLoadingProgress(100)
  }, [])

  // Загрузка данных магазина
  const loadShopData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading shop data...")
      setLoadingSteps((prev) => ({ ...prev, shop: "loading" }))

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
      setLoadingSteps((prev) => ({ ...prev, shop: "complete" }))
    } catch (error) {
      console.error("Error loading shop data:", error)
      setLoadingSteps((prev) => ({ ...prev, shop: "error" }))
    }
  }, [user?.id])

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

  // Загрузка данных заданий
  const loadTasksData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading tasks data...")
      setLoadingSteps((prev) => ({ ...prev, tasks: "loading" }))
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
      setLoadingSteps((prev) => ({ ...prev, tasks: "complete" }))
    } catch (error) {
      console.error("Error loading tasks data:", error)
      // Создаем тестовые данные при ошибке
      setTasksData({ tasks: createMockTasks(), loading: false })
      setLoadingSteps((prev) => ({ ...prev, tasks: "error" }))
    }
  }, [user?.id])

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

  // Загрузка рангов
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
      setLoadingSteps((prev) => ({ ...prev, mining: "loading" }))

      // Проверяем, есть ли уже кэшированные данные
      if (cachedMiningInfo) {
        console.log("Using existing cached mining data")
        setLoadingSteps((prev) => ({ ...prev, mining: "complete" }))
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
      setLoadingSteps((prev) => ({ ...prev, mining: "complete" }))
    } catch (error) {
      console.error("Error preloading mining data:", error)
      setLoadingSteps((prev) => ({ ...prev, mining: "error" }))
    }
  }, [user?.id, cachedMiningInfo])

  // Предзагрузка изображений магазина
  const preloadShopImages = useCallback(async () => {
    if (!shopData.models || shopData.models.length === 0) return

    try {
      console.log("Preloading shop images...")
      setLoadingSteps((prev) => ({ ...prev, images: "loading" }))

      // Собираем все URL изображений из моделей магазина
      const imageUrls = shopData.models.map((model) => model.image_url).filter((url) => url && url.trim() !== "")

      // Предзагружаем изображения
      await preloadImages(imageUrls, (progress) => {
        // Обновляем прогресс загрузки (максимум 10%)
        const progressIncrement = Math.floor(progress * 10)
        if (progressIncrement > 0) {
          setLoadingProgress((prev) => Math.min(90, prev + progressIncrement))
        }
      })

      console.log("Shop images preloaded successfully")
      setLoadingSteps((prev) => ({ ...prev, images: "complete" }))
    } catch (error) {
      console.error("Error preloading shop images:", error)
      setLoadingSteps((prev) => ({ ...prev, images: "error" }))
    }
  }, [shopData.models])

  // Предзагрузка изображений заданий
  const preloadTaskImages = useCallback(async () => {
    if (!tasksData.tasks || tasksData.tasks.length === 0) return

    try {
      console.log("Preloading task images...")

      // Собираем все URL изображений из заданий
      const imageUrls = tasksData.tasks.map((task) => task.icon_url).filter((url) => url && url.trim() !== "")

      // Предзагружаем изображения
      await preloadImages(imageUrls, (progress) => {
        // Обновляем прогресс загрузки (максимум 5%)
        const progressIncrement = Math.floor(progress * 5)
        if (progressIncrement > 0) {
          setLoadingProgress((prev) => Math.min(95, prev + progressIncrement))
        }
      })

      console.log("Task images preloaded successfully")
    } catch (error) {
      console.error("Error preloading task images:", error)
    }
  }, [tasksData.tasks])

  // Обновление кэша майнинга
  const updateMiningInfoCache = useCallback((data) => {
    console.log("Updating mining info cache:", data)
    setCachedMiningInfo(data)
  }, [])

  // Загрузка данных после загрузки пользователя
  useEffect(() => {
    if (user) {
      // Запускаем загрузку данных параллельно
      Promise.all([
        loadShopData(),
        loadMinersData(),
        loadTasksData(),
        loadRatingData(),
        loadTransactionsData(),
        loadRanksData(),
        preloadMiningData(),
      ])
        .then(() => {
          console.log("All data loaded successfully")
          setLoadingProgress(90) // Прогресс после загрузки всех данных
          return preloadShopImages() // Предзагружаем изображения магазина после загрузки данных
        })
        .then(() => {
          console.log("Shop images preloaded successfully")
          return preloadTaskImages() // Предзагружаем изображения заданий после загрузки изображений магазина
        })
        .then(() => {
          console.log("Task images preloaded successfully")
          setLoadingProgress(100) // Полный прогресс после предзагрузки изображений
        })
        .catch((err) => {
          console.error("Error loading data:", err)
        })
    }
  }, [
    user,
    loadShopData,
    loadMinersData,
    loadTasksData,
    loadRatingData,
    loadTransactionsData,
    loadRanksData,
    preloadMiningData,
    preloadShopImages,
    preloadTaskImages,
  ])

  // Обработчик обновления баланса
  const handleBalanceUpdate = useCallback(
    async (newBalance) => {
      await updateBalance(newBalance)
    },
    [updateBalance],
  )

  // Обработчик завершения задачи
  const handleTaskComplete = useCallback(
    async (taskId, reward) => {
      try {
        // Отправляем запрос на сервер для завершения задачи
        const { data, error } = await supabase.rpc("complete_task", {
          task_id_param: taskId,
          user_id_param: user.id,
          reward_param: reward,
        })

        if (error) {
          console.error("Error completing task:", error)
          return false // Возвращаем false в случае ошибки
        }

        // Обновляем баланс пользователя
        await updateBalance(user.balance + reward)

        // Обновляем состояние задач, чтобы убрать выполненную задачу из списка
        setTasksData((prevTasksData) => ({
          ...prevTasksData,
          tasks: prevTasksData.tasks.filter((task) => task.id !== taskId),
        }))

        return true // Возвращаем true, если задача успешно завершена
      } catch (error) {
        console.error("Error completing task:", error)
        return false // Возвращаем false в случае ошибки
      }
    },
    [user?.id, user?.balance, updateBalance],
  )

  // Memoize tasksData
  const memoizedTasksData = useMemo(() => tasksData, [tasksData])

  // Отображение загрузочного экрана или контента приложения
  return (
    <Router>
      {showSplash ? (
        <>
          <LoadingScreen loadingProgress={loadingProgress} loadingSteps={loadingSteps} />
          {user && (
            <DataPrefetcher userId={user.id} onProgress={handleLoadingProgress} onComplete={handleLoadingComplete} />
          )}
        </>
      ) : userLoading ? (
        <LoadingFallback />
      ) : userError ? (
        <div className="error-container">Error: {userError}</div>
      ) : (
        <AppContent
          user={user}
          balance={user?.balance || 0}
          handleBalanceUpdate={handleBalanceUpdate}
          shopData={shopData}
          minersData={minersData}
          tasksData={memoizedTasksData}
          handleTaskComplete={handleTaskComplete}
          ratingData={ratingData}
          transactionsData={transactionsData}
          ranksData={ranksData}
          hasMinerPass={hasMinerPass}
          cachedMiningInfo={cachedMiningInfo}
          onCacheUpdate={updateMiningInfoCache}
        />
      )}
    </Router>
  )
}

export default App

