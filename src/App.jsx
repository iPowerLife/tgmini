;("use client")

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import HomePage from "./pages/home-page"
import Shop from "./components/shop"
import { useMinerPass } from "./hooks/useMinerPass"
import React from "react"
// Временно закомментируем импорт LoadingScreen
// import LoadingScreen from "./components/loading-screen"
import TasksPage from "./pages/tasks"
import { RatingSection } from "./components/rating-section"
import { UserProfile } from "./components/user-profile"

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
  // Оставляем базовые состояния
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  // Удаляем состояние loading и все связанные с загрузкой состояния

  // Остальные состояния оставляем как есть
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState({ miners: [], totalPower: 0 })
  const [tasksData, setTasksData] = useState({ tasks: [], loading: true })
  const [ratingData, setRatingData] = useState({ users: [] })
  const [transactionsData, setTransactionsData] = useState({ transactions: [] })
  const [ranksData, setRanksData] = useState({ ranks: [] })
  const [cachedMiningInfo, setCachedMiningInfo] = useState(null)

  const { hasMinerPass } = useMinerPass(user?.id)

  // Объявляем функции для обновления баланса и завершения задач
  const handleBalanceUpdate = useCallback((newBalance) => {
    setBalance(newBalance)
  }, [])

  const handleTaskComplete = useCallback(() => {
    // Здесь должна быть логика обновления задач
    console.log("Task completed!")
  }, [])

  const updateMiningInfoCache = useCallback(() => {
    console.log("Updating mining info cache...")
  }, [])

  // Инициализация приложения
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Initializing app...")

        const telegram = initTelegram()
        console.log("Telegram WebApp status:", telegram ? "доступен" : "недоступен")

        const userData = getTelegramUser()
        console.log("User data:", userData)

        if (!userData) {
          throw new Error("Не удалось получить данные пользователя из Telegram")
        }

        const dbUser = await createOrUpdateUser(userData)
        console.log("Database user:", dbUser)

        const userWithDisplay = {
          ...dbUser,
          photo_url: userData.photo_url,
          display_name: userData.username ? `@${userData.username}` : userData.first_name || "Неизвестный пользователь",
          has_miner_pass: hasMinerPass,
        }

        setUser(userWithDisplay)
        setBalance(dbUser.balance)

        // Загружаем все данные последовательно
        const loadShopData = async () => {
          // Здесь должна быть логика загрузки данных для магазина
          console.log("Loading shop data...")
          setShopData({ categories: [], models: [] }) // Заглушка
        }

        const loadMinersData = async () => {
          // Здесь должна быть логика загрузки данных о шахтерах
          console.log("Loading miners data...")
          setMinersData({ miners: [], totalPower: 0 }) // Заглушка
        }

        const loadTasksData = async () => {
          // Здесь должна быть логика загрузки данных о задачах
          console.log("Loading tasks data...")
          setTasksData({ tasks: [], loading: false }) // Заглушка
        }

        const loadRatingData = async () => {
          // Здесь должна быть логика загрузки данных рейтинга
          console.log("Loading rating data...")
          setRatingData({ users: [] }) // Заглушка
        }

        const loadTransactionsData = async () => {
          // Здесь должна быть логика загрузки данных о транзакциях
          console.log("Loading transactions data...")
          setTransactionsData({ transactions: [] }) // Заглушка
        }

        const loadRanksData = async () => {
          // Здесь должна быть логика загрузки данных о рангах
          console.log("Loading ranks data...")
          setRanksData({ ranks: [] }) // Заглушка
        }

        const preloadMiningData = async () => {
          console.log("Preloading mining data...")
        }

        await loadShopData()
        await loadMinersData()
        await loadTasksData()
        await loadRatingData()
        await loadTransactionsData()
        await loadRanksData()
        await preloadMiningData()

        // Диспатчим событие о завершении загрузки
        window.dispatchEvent(new Event("app-data-loaded"))
      } catch (err) {
        console.error("Error initializing app:", err)
        setError(err.message)
      }
    }

    initApp()
  }, []) // Убираем все зависимости, чтобы эффект выполнился только один раз

  // Если есть ошибка, показываем её
  if (error) {
    return (
      <div className="root-container">
        <div className="page-container">
          <div className="section-container error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="shop-button mt-4">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Сразу рендерим контент, не дожидаясь загрузки
  return (
    <Router>
      <AppContent
        user={user}
        balance={balance}
        handleBalanceUpdate={handleBalanceUpdate}
        shopData={shopData}
        minersData={minersData}
        tasksData={tasksData}
        handleTaskComplete={handleTaskComplete}
        ratingData={ratingData}
        transactionsData={transactionsData}
        ranksData={ranksData}
        hasMinerPass={hasMinerPass}
        cachedMiningInfo={cachedMiningInfo}
        onCacheUpdate={updateMiningInfoCache}
      />
    </Router>
  )
}

export default App

