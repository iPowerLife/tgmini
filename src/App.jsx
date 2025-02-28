"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { initTelegram, getTelegramUser } from "./utils/telegram"
// Добавляем импорты новых компонентов
import { Shop } from "./components/shop"
import { MinersList } from "./components/miners-list"
import { UserProfile } from "./components/user-profile"
// В начале файла добавляем импорт
import { BottomMenu } from "./components/bottom-menu"

function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [isMining, setIsMining] = useState(false)
  const [showIncrease, setShowIncrease] = useState(false)
  const [particles, setParticles] = useState([])
  const [tg, setTg] = useState(null)
  // В компоненте App добавляем состояние для отображения магазина
  const [showShop, setShowShop] = useState(false)
  // В компоненте App добавляем состояние для активного раздела
  const [activeSection, setActiveSection] = useState("home")

  // Инициализируем Telegram WebApp
  useEffect(() => {
    const initTelegramAndUser = async () => {
      try {
        // Инициализируем Telegram WebApp
        const telegram = initTelegram()
        console.log("Telegram initialized:", telegram)
        setTg(telegram)

        // Получаем пользователя Telegram
        const telegramUser = getTelegramUser()
        console.log("Got Telegram user:", telegramUser)

        if (!telegramUser?.id) {
          throw new Error("No valid user data")
        }

        // Ищем пользователя в базе
        const { data: users, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUser.id)

        if (selectError) {
          console.error("Error selecting user:", selectError)
          throw selectError
        }

        console.log("Database query result:", users)
        let user = users?.[0]

        // Если пользователя нет, создаем
        if (!user) {
          console.log("Creating new user with data:", telegramUser)

          // Создаем пользователя с данными из Telegram
          const { data: newUsers, error: createError } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username || null, // Используем реальный username или null
                first_name: telegramUser.first_name || "", // Используем реальное имя
                balance: 0,
                mining_power: 1,
                level: 1,
                experience: 0,
                next_level_exp: 100,
              },
            ])
            .select()

          if (createError) {
            console.error("Error creating user:", createError)
            throw createError
          }

          console.log("Created new user:", newUsers)
          user = newUsers[0]

          // Создаем запись в mining_stats
          const { error: statsError } = await supabase.from("mining_stats").insert([
            {
              user_id: user.id,
              total_mined: 0,
              mining_count: 0,
            },
          ])

          if (statsError) {
            console.error("Error creating mining stats:", statsError)
            throw statsError
          }
        }

        console.log("Setting user state:", user)
        setUser(user)
        setBalance(user.balance)
      } catch (error) {
        console.error("Error in initialization:", error)
        // Больше не создаем тестового пользователя при ошибке
        throw error
      }
    }

    initTelegramAndUser()
  }, [])

  const createParticle = (e) => {
    if (!e?.target) return // Проверяем наличие event и target

    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const particles = []
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      particles.push({
        id: Date.now() + i,
        x,
        y,
        angle,
        speed: 2 + Math.random() * 2,
        life: 1,
      })
    }
    setParticles(particles)
    setTimeout(() => setParticles([]), 1000)
  }

  const handleMining = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isMining) {
      console.log("Mining blocked: already mining")
      return
    }

    if (!user) {
      console.log("Mining blocked: no user", { user })
      return
    }

    try {
      console.log("Starting mining for user:", user)
      createParticle(e)
      setIsMining(true)

      // Обновляем баланс в базе
      const { data, error } = await supabase.rpc("update_user_balance", {
        user_id_param: user.id,
        amount_param: 1,
        type_param: "mining",
        description_param: "Mining reward",
      })

      if (error) {
        console.error("Error updating balance:", error)
        throw error
      }

      console.log("Balance updated:", data)

      // Обновляем статистику майнинга
      const { data: statsData, error: statsError } = await supabase.rpc("update_mining_stats", {
        user_id_param: user.id,
        mined_amount: 1,
      })

      if (statsError) {
        console.error("Error updating stats:", statsError)
        throw statsError
      }

      console.log("Mining stats updated:", statsData)

      setBalance((prev) => prev + 1)
      setShowIncrease(true)
      setTimeout(() => setShowIncrease(false), 1000)
    } catch (error) {
      console.error("Error mining:", error)
    } finally {
      setIsMining(false)
    }
  }

  // Функция для рендеринга контента в зависимости от активного раздела
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <>
            {/* Карточка баланса */}
            <div className="balance-card">
              <div className="balance-background" />
              <div className="balance-content">
                <div className="balance-label">Баланс</div>
                <div className="balance-amount">
                  <span>
                    {balance.toFixed(2)}
                    {showIncrease && <span className="balance-increase">+1</span>}
                  </span>
                  <span className="balance-currency">💎</span>
                </div>
              </div>
            </div>

            <MinersList user={user} />
          </>
        )
      case "shop":
        return <Shop user={user} onPurchase={(newBalance) => setBalance(newBalance)} />
      case "tasks":
        return <div className="section-container">Раздел заданий в разработке</div>
      case "rating":
        return <div className="section-container">Раздел рейтинга в разработке</div>
      case "profile":
        return <UserProfile user={user} />
      default:
        return null
    }
  }

  // В return добавляем BottomMenu и оборачиваем контент в контейнер
  return (
    <div className="app-wrapper">
      <div className="background-gradient" />
      <div className="decorative-circle-1" />
      <div className="decorative-circle-2" />

      <div className="app-container">{renderContent()}</div>

      <BottomMenu activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  )
}

export default App

