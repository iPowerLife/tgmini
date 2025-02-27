"use client"

import React from "react"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"
import { getTelegramUser, initTelegram } from "./utils/telegram"
import { getUser, createUser, updateUser } from "./utils/database"

// Добавим импорт компонента достижений
import { Achievements } from "./components/Achievements"
import { getAchievements, checkAchievements } from "./utils/achievements"

function App() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isMining, setIsMining] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)
  const [error, setError] = React.useState(null)
  const [debug, setDebug] = React.useState({})

  // В компоненте App добавим:
  const [showAchievements, setShowAchievements] = React.useState(false)
  const [achievements, setAchievements] = React.useState([])

  // Инициализация пользователя
  React.useEffect(() => {
    async function initUser() {
      try {
        console.log("Starting initialization...")

        // Инициализируем Telegram Web App
        const tgInitialized = initTelegram()
        setDebug((prev) => ({ ...prev, tgInitialized }))

        // Получаем данные пользователя из Telegram
        const telegramUser = getTelegramUser()
        setDebug((prev) => ({ ...prev, telegramUser }))

        if (!telegramUser?.id) {
          throw new Error("Не удалось получить ID пользователя Telegram")
        }

        // Получаем или создаем пользователя в базе данных
        let userData = await getUser(telegramUser.id)
        setDebug((prev) => ({ ...prev, existingUser: userData }))

        if (!userData) {
          console.log("User not found, creating new user...")
          userData = await createUser(telegramUser.id, telegramUser.username)
          setDebug((prev) => ({ ...prev, newUser: userData }))
        }

        if (!userData) {
          throw new Error("Не удалось загрузить или создать пользователя")
        }

        setUser(userData)
        console.log("Initialization completed successfully")
      } catch (err) {
        console.error("Initialization error:", err)
        setError(err.message)
        setDebug((prev) => ({ ...prev, error: err }))
      } finally {
        setLoading(false)
      }
    }

    initUser()
  }, [])

  // Добавим загрузку достижений при инициализации
  React.useEffect(() => {
    if (user?.id) {
      loadAchievements()
    }
  }, [user?.id])

  // Функция загрузки достижений
  const loadAchievements = async () => {
    const achievementsData = await getAchievements(user.id)
    setAchievements(achievementsData)
  }

  // Функция майнинга
  const mine = async () => {
    if (isMining || cooldown > 0 || !user?.id) return

    setIsMining(true)
    setCooldown(3)

    try {
      console.log("Starting mining process...")
      const minedAmount = user.mining_power
      const expGained = Math.floor(minedAmount * 0.1)

      // Обновляем данные пользователя в базе
      const updatedUser = await updateUser(user.id, {
        balance: user.balance + minedAmount,
        experience: user.experience + expGained,
        last_mining: new Date().toISOString(),
      })

      // После обновления данных пользователя
      if (updatedUser) {
        setUser(updatedUser)
        await checkAchievements(user.id, updatedUser)
        await loadAchievements() // Обновляем список достижений
      } else {
        throw new Error("Не удалось обновить данные пользователя")
      }
    } catch (error) {
      console.error("Mining error:", error)
      setError("Ошибка при майнинге")
    } finally {
      setIsMining(false)
    }
  }

  // Обработка таймера перезарядки
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h2>Загрузка...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h2>Ошибка</h2>
        <p style={{ color: "#ff6b6b" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>

        {/* Отладочная информация */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <p>Debug Info:</p>
          {JSON.stringify(debug, null, 2)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h2>Ошибка</h2>
        <p>Не удалось загрузить данные пользователя</p>

        {/* Отладочная информация */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <p>Debug Info:</p>
          {JSON.stringify(debug, null, 2)}
        </div>
      </div>
    )
  }

  // В render добавим кнопку достижений и сам компонент
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Stats
        balance={user.balance}
        miningPower={user.mining_power}
        level={user.level}
        experience={user.experience}
        nextLevelExp={user.next_level_exp}
      />

      <div style={{ display: "grid", gap: "15px" }}>
        <MiningButton onMine={mine} cooldown={cooldown} isCooldown={cooldown > 0} />

        <button
          onClick={() => setShowAchievements(true)}
          style={{
            padding: "15px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Достижения 🏆
        </button>
      </div>

      {showAchievements && <Achievements achievements={achievements} onClose={() => setShowAchievements(false)} />}

      {/* Отладочная информация */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        <p>Debug Info:</p>
        {JSON.stringify(debug, null, 2)}
      </div>
    </div>
  )
}

export default App

