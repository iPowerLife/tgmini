"use client"

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { initTelegram, getTelegramUser, createOrUpdateUser } from "./utils/telegram"
import { BottomMenu } from "./components/bottom-menu"
import { MinersList } from "./components/miners-list"
import { Shop } from "./components/shop"
import { UserProfile } from "./components/user-profile"
import { TasksSection } from "./components/tasks-section"
import { supabase } from "./supabase"
import { RatingSection } from "./components/rating-section"
import { Toast } from "./components/toast"

// Компонент для содержимого приложения
function AppContent({
  user,
  balance,
  handleBalanceUpdate,
  shopData,
  minersData,
  tasksData,
  handleTaskComplete,
  ratingData,
  notifications,
  removeNotification,
}) {
  const location = useLocation()

  return (
    <div className="root-container">
      <div className="page-container">
        {/* Уведомления */}
        <div className="notifications-container">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <>
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
              </>
            }
          />
          <Route
            path="/shop"
            element={
              <Shop
                user={user}
                onPurchase={handleBalanceUpdate}
                categories={shopData.categories}
                models={shopData.models}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksSection
                user={user}
                onBalanceUpdate={handleBalanceUpdate}
                tasks={tasksData.tasks}
                onTaskComplete={handleTaskComplete}
              />
            }
          />
          <Route path="/rating" element={<RatingSection currentUserId={user?.id} users={ratingData.users} />} />
          <Route
            path="/profile"
            element={<UserProfile user={user} miners={minersData.miners} totalPower={minersData.totalPower} />}
          />
        </Routes>
      </div>
      <BottomMenu />
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  // Состояния для данных
  const [shopData, setShopData] = useState({ categories: [], models: [] })
  const [minersData, setMinersData] = useState({ miners: [], totalPower: 0 })
  const [tasksData, setTasksData] = useState({ tasks: [] })
  const [ratingData, setRatingData] = useState({ users: [] })

  // Функция для добавления уведомлений
  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])

    // Автоматически удаляем уведомление через 5 секунд
    setTimeout(() => {
      removeNotification(id)
    }, 5000)

    return id
  }, [])

  // Функция для удаления уведомлений
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  // Функция для обновления баланса пользователя
  const updateUserBalance = useCallback(async (userId, amount) => {
    try {
      // Получаем текущий баланс пользователя
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", userId)
        .single()

      if (userError) throw userError

      const newBalance = userData.balance + amount

      // Обновляем баланс пользователя
      const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

      if (updateError) throw updateError

      return newBalance
    } catch (error) {
      console.error("Error updating user balance:", error)
      return null
    }
  }, [])

  // Загрузка данных магазина
  const loadShopData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log("Loading shop data...")
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
    } catch (error) {
      console.error("Error loading shop data:", error)
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
      const { data, error } = await supabase.rpc("get_available_tasks", {
        user_id_param: user.id,
      })

      if (error) throw error

      setTasksData({ tasks: data?.tasks || [] })
      console.log("Tasks data loaded successfully")
    } catch (error) {
      console.error("Error loading tasks data:", error)
    }
  }, [user?.id])

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

  // Функция для обработки рефералов - вынесем её отдельно
  const processReferral = useCallback(
    async (startParam, currentUser) => {
      if (!startParam || !currentUser || !currentUser.id) {
        console.log("DEBUG REFERRAL: Missing start param or current user")
        return
      }

      console.log("DEBUG REFERRAL: Processing referral. Param:", startParam, "Current user:", currentUser.id)

      try {
        // Проверяем, что пользователь не регистрирует сам себя
        if (startParam === currentUser.id.toString()) {
          console.log("DEBUG REFERRAL: User tried to refer themselves")
          return
        }

        // Получаем пользователя-реферера по telegram_id из параметра
        const { data: referrerData, error: referrerError } = await supabase
          .from("users")
          .select("id, telegram_id, display_name")
          .eq("telegram_id", startParam)
          .single()

        console.log("DEBUG REFERRAL: Referrer data:", referrerData, "Error:", referrerError)

        if (referrerError || !referrerData) {
          console.error("DEBUG REFERRAL: Referrer not found:", referrerError)
          return
        }

        // Получаем текущего пользователя из базы данных
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, telegram_id, display_name")
          .eq("telegram_id", currentUser.id)
          .single()

        console.log("DEBUG REFERRAL: Current user data:", userData, "Error:", userError)

        if (userError || !userData) {
          console.error("DEBUG REFERRAL: Current user not found:", userError)
          return
        }

        // Проверяем, не зарегистрирован ли уже этот реферал
        const { data: existingReferral, error: existingError } = await supabase
          .from("referral_users")
          .select("id")
          .eq("referrer_id", referrerData.id)
          .eq("referred_id", userData.id)
          .single()

        console.log("DEBUG REFERRAL: Existing referral:", existingReferral, "Error:", existingError)

        // PGRST116 - это код ошибки "не найдено"
        if (!existingError || (existingError.code !== "PGRST116" && existingReferral)) {
          console.log("DEBUG REFERRAL: Referral already exists")
          return
        }

        // Определяем награду за реферала
        const REFERRAL_REWARD = 10 // Награда за реферала (10 кристаллов)

        // Регистрируем нового реферала
        const { data: insertData, error: insertError } = await supabase
          .from("referral_users")
          .insert({
            referrer_id: referrerData.id,
            referred_id: userData.id,
            status: "active",
            reward: REFERRAL_REWARD,
            notified: false,
          })
          .select()

        console.log("DEBUG REFERRAL: Insert result:", insertData, "Error:", insertError)

        if (insertError) {
          console.error("DEBUG REFERRAL: Error registering referral:", insertError)
          return
        }

        console.log("DEBUG REFERRAL: Referral successfully registered")

        // Начисляем награду рефереру
        const newBalance = await updateUserBalance(referrerData.id, REFERRAL_REWARD)

        console.log("DEBUG REFERRAL: New balance after reward:", newBalance)

        if (newBalance !== null) {
          // Отправляем уведомление рефереру (если это текущий пользователь)
          if (referrerData.telegram_id === currentUser.id) {
            addNotification(`Вы получили ${REFERRAL_REWARD} 💎 за приглашение пользователя!`, "success")
          }

          // Записываем в лог транзакцию
          const { data: transactionData, error: transactionError } = await supabase
            .from("transactions")
            .insert({
              user_id: referrerData.id,
              amount: REFERRAL_REWARD,
              type: "referral_reward",
              description: `Награда за приглашение пользователя ID:${userData.id}`,
            })
            .select()

          console.log("DEBUG REFERRAL: Transaction record:", transactionData, "Error:", transactionError)
        }
      } catch (error) {
        console.error("DEBUG REFERRAL: Error processing referral:", error)
      }
    },
    [addNotification, updateUserBalance],
  )

  // Инициализация приложения
  useEffect(() => {
    let mounted = true

    const initApp = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Initializing app...")

        // Инициализируем Telegram WebApp
        const telegram = initTelegram()
        console.log("Telegram WebApp status:", telegram ? "доступен" : "недоступен")

        // Получаем данные пользователя
        const userData = getTelegramUser()
        console.log("User data:", userData)

        if (!userData) {
          throw new Error("Не удалось получить данные пользователя из Telegram")
        }

        // Создаем/обновляем пользователя в базе данных
        const dbUser = await createOrUpdateUser(userData)
        console.log("Database user:", dbUser)

        if (!dbUser) {
          throw new Error("Не удалось создать/обновить пользователя в базе")
        }

        // Получаем параметр startapp из URL
        const startParam = telegram?.initDataUnsafe?.start_param
        console.log("Start param from Telegram:", startParam)

        // Обрабатываем реферальную ссылку, если она есть
        if (startParam) {
          await processReferral(startParam, userData)
        }

        if (mounted) {
          const userWithDisplay = {
            ...dbUser,
            photo_url: userData.photo_url,
            display_name: userData.username
              ? `@${userData.username}`
              : userData.first_name || "Неизвестный пользователь",
          }

          setUser(userWithDisplay)
          setBalance(dbUser.balance)
          console.log("User initialized:", userWithDisplay)

          // Проверяем, есть ли новые рефералы
          const checkNewReferrals = async () => {
            try {
              console.log("DEBUG: Checking new referrals for user ID:", dbUser.id)

              const { data: newReferrals, error } = await supabase
                .from("referral_users")
                .select(`
                  id,
                  referred:referred_id(id, display_name),
                  created_at,
                  reward
                `)
                .eq("referrer_id", dbUser.id)
                .eq("status", "active")
                .eq("notified", false)
                .order("created_at", { ascending: false })

              console.log("DEBUG: New referrals query result:", newReferrals, "Error:", error)

              if (error) throw error

              if (newReferrals && newReferrals.length > 0) {
                // Отмечаем рефералов как уведомленных
                const referralIds = newReferrals.map((ref) => ref.id)

                const { data: updateData, error: updateError } = await supabase
                  .from("referral_users")
                  .update({ notified: true })
                  .in("id", referralIds)

                console.log("DEBUG: Update notified status result:", updateData, "Error:", updateError)

                // Показываем уведомления о новых рефералах
                newReferrals.forEach((referral) => {
                  const referredName = referral.referred?.display_name || "Новый пользователь"
                  const reward = referral.reward || 10
                  addNotification(`${referredName} присоединился по вашей ссылке! +${reward} 💎`, "success")
                })
              }
            } catch (error) {
              console.error("Error checking new referrals:", error)
            }
          }

          // Проверяем новых рефералов
          await checkNewReferrals()

          // Загружаем все данные сразу после инициализации пользователя
          await Promise.all([loadShopData(), loadMinersData(), loadTasksData(), loadRatingData()])
          console.log("All data loaded successfully")
        }
      } catch (err) {
        console.error("Error initializing app:", err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initApp()

    return () => {
      mounted = false
    }
  }, [loadShopData, loadMinersData, loadTasksData, loadRatingData, addNotification, processReferral])

  // Обработчик обновления баланса
  const handleBalanceUpdate = useCallback(
    (newBalance) => {
      console.log("Updating balance:", newBalance)
      setBalance(newBalance)
      setUser((prev) => ({ ...prev, balance: newBalance }))
      // Перезагружаем данные майнеров после обновления баланса
      loadMinersData()
    },
    [loadMinersData],
  )

  // Обработчик завершения задания
  const handleTaskComplete = useCallback(
    (taskId) => {
      console.log("Task completed:", taskId)
      loadTasksData()
    },
    [loadTasksData],
  )

  if (loading) {
    return (
      <div className="root-container">
        <div className="page-container">
          <div className="section-container">
            <div className="loading">Загрузка приложения...</div>
          </div>
        </div>
      </div>
    )
  }

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
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </Router>
  )
}

export default App

