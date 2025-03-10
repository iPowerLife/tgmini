;("use client")

import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
// Убедитесь, что импорт указывает на правильный файл
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
// Заменим импорт функции предзагрузки изображений
import { preloadImages } from "./utils/image-utils"

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

// Компонент для сохранения текущего пути
function RouteStateManager() {
  const location = useLocation()

  // Сохраняем текущий путь при каждом изменении маршрута
  useEffect(() => {
    // Не сохраняем путь, если это начальная загрузка
    if (location.pathname !== "/") {
      localStorage.setItem("lastRoute", location.pathname)
    }
  }, [location])

  return null
}

// В функции AppContent добавим tasksData в параметры
const AppContent = React.memo(function AppContent({
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
  const navigate = useNavigate()

  // Восстанавливаем последний путь при монтировании компонента
  useEffect(() => {
    const lastRoute = localStorage.getItem("lastRoute")
    if (lastRoute) {
      navigate(lastRoute, { replace: true })
      // Очищаем сохраненный путь после восстановления
      localStorage.removeItem("lastRoute")
    }
  }, [navigate])

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
        <RouteStateManager />
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
})

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
  // Исправляем синтаксис useState
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
  // Обновим функцию loadShopData для начала предзагрузки изображений сразу после получения данных
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

      const categories = categoriesResponse.data || []
      const models = modelsResponse.data || []

      setShopData({
        categories,
        models,
      })

      console.log("Shop data loaded successfully")
      updateLoadingProgress("miners", "complete", 15)

      // Начинаем предзагрузку изображений сразу после получения данных
      if (models.length > 0) {
        // Предзагружаем первые 5 изображений немедленно
        const priorityImages = models
          .slice(0, 5)
          .filter((model) => model.image_url && model.image_url.trim() !== "")
          .map((model) => ({
            src: model.image_url,
            fallbackSrc: `/images/miners/default-${model.category_id || "basic"}.png`,
          }))

        if (priorityImages.length > 0) {
          preloadImages(priorityImages)
        }
      }
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

  // Добавляем новую функцию для предзагрузки изображений после функции preloadMiningData
  const preloadShopImages = useCallback(async () => {
    if (!shopData.models || shopData.models.length === 0) return

    try {
      console.log("Preloading shop images...")
      updateLoadingProgress("images", "loading")

      // Собираем все URL изображений из моделей магазина с запасными URL
      const imageUrls = shopData.models
        .filter((model) => model.image_url && model.image_url.trim() !== "")
        .map((model) => ({
          src: model.image_url,
          fallbackSrc: `/images/miners/default-${model.category_id || "basic"}.png`,
        }))

      console.log(`Starting to preload ${imageUrls.length} shop images`)

      // Предзагружаем изображения с увеличенным concurrency
      await preloadImages(
        imageUrls,
        (progress) => {
          // Обновляем прогресс загрузки (максимум 15%)
          const progressIncrement = Math.floor(progress * 15)
          if (progressIncrement > 0) {
            updateLoadingProgress("images", "loading", progressIncrement)
          }
        },
        { concurrency: 10 },
      )

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
  const dataFetchedRef = useRef(false)
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
            const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param
            if (startParam && startParam.startsWith("ref")) {
              const referrerId = startParam.substring(3) // Извлекаем ID реферера
              console.log("Referral detected, referrer ID:", referrerId)

              // Отправляем запрос на сервер для связывания пользователя с реферером
              const { data, error } = await supabase
                .from("users")
                .update({ referrer_id: referrerId })
                .eq("id", telegramUser.id)
                .select()

              if (error) {
                console.error("Error updating referrer ID:", error)
              } else {
                console.log("Referrer ID updated successfully:", data)
              }
            }
          } catch (error) {
            console.error("Error handling referral:", error)
          }
        }

        // Создаем или обновляем пользователя в базе данных
        const newUser = await createOrUpdateUser(userData)

        if (mounted && newUser) {
          setUser(newUser)
          updateLoadingProgress("user", "complete", 15)
          setLoadingProgress(30) // Прогресс после загрузки пользователя

          // Обрабатываем реферальную ссылку только при создании нового пользователя
          if (newUser.created_at === newUser.updated_at) {
            await handleReferral(newUser)
          }

          // Загружаем баланс пользователя
          const { data: balanceData, error: balanceError } = await supabase
            .from("users")
            .select("balance")
            .eq("id", newUser.id)
            .single()

          if (balanceError) throw balanceError

          if (mounted) {
            setBalance(balanceData?.balance || 0)
            setLoadingProgress(40) // Прогресс после загрузки баланса
          }
        } else {
          console.warn("User data is null or component unmounted")
          updateLoadingProgress("user", "error")
        }
      } catch (err) {
        console.error("Error initializing app:", err)
        setError(err.message || "Failed to initialize app")
        updateLoadingProgress("database", "error")
        updateLoadingProgress("user", "error")
      } finally {
        if (mounted) {
          setLoading(false)
          setLoadingProgress(50) // Прогресс перед загрузкой данных
        }
      }
    }

    initApp()

    return () => {
      mounted = false
    }
  }, [])

  // Загрузка данных после загрузки пользователя
  useEffect(() => {
    if (user && !dataFetchedRef.current) {
      dataFetchedRef.current = true

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
          setLoadingProgress(80)

          // Ждем завершения загрузки изображений
          return Promise.all([preloadShopImages(), preloadTaskImages()])
        })
        .then(() => {
          console.log("All images preloaded successfully")
          setLoadingProgress(100)

          // Добавляем задержку для гарантии, что все изображения загружены
          return new Promise((resolve) => setTimeout(resolve, 1000))
        })
        .then(() => {
          // Закрываем загрузочный экран после небольшой задержки
          setTimeout(() => setShowSplash(false), 500)
        })
        .catch((err) => {
          console.error("Error loading data:", err)
          setError(err.message || "Failed to load data")

          // Даже в случае ошибки закрываем загрузочный экран через 3 секунды
          setTimeout(() => setShowSplash(false), 3000)
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

  // Обновление баланса
  const handleBalanceUpdate = useCallback(
    async (newBalance) => {
      setBalance(newBalance)
      // Обновляем баланс в объекте пользователя
      if (user) {
        setUser((prevUser) => ({
          ...prevUser,
          balance: newBalance,
        }))
      }
    },
    [user, setBalance, setUser],
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
        setBalance((prevBalance) => prevBalance + reward)

        // Обновляем состояние задач, чтобы убрать  => prevBalance + reward)

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
    [user?.id, setBalance],
  )

  // Memoize tasksData
  const memoizedTasksData = useMemo(() => tasksData, [tasksData])

  // Отображение загрузочного экрана или контента приложения
  return (
    <Router>
      {showSplash ? (
        <LoadingScreen loadingProgress={loadingProgress} loadingSteps={loadingSteps} />
      ) : loading ? (
        <LoadingFallback />
      ) : error ? (
        <div className="error-container">Error: {error}</div>
      ) : (
        <AppContent
          user={user}
          balance={balance}
          handleBalanceUpdate={handleBalanceUpdate}
          shopData={shopData}
          minersData={minersData}
          tasksData={memoizedTasksData} // Передаем memoizedTasksData
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

