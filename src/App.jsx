"use client"

import React from "react"
import { supabase, checkDatabaseConnection, initializeDatabase, createUser, getUserData } from "./supabase"

function App() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [miningCooldown, setMiningCooldown] = React.useState(false)
  const [debugInfo, setDebugInfo] = React.useState({
    telegramWebAppAvailable: false,
    initDataReceived: false,
    userId: null,
    host: window.location.host,
    databaseConnected: false,
    databaseInitialized: false,
  })

  React.useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      console.log("Starting app initialization...")

      // Проверяем подключение к базе данных
      const isConnected = await checkDatabaseConnection()
      setDebugInfo((prev) => ({
        ...prev,
        databaseConnected: isConnected,
      }))

      if (!isConnected) {
        throw new Error("Нет подключения к базе данных")
      }

      // Инициализируем базу данных
      const isInitialized = await initializeDatabase()
      setDebugInfo((prev) => ({
        ...prev,
        databaseInitialized: isInitialized,
      }))

      if (!isInitialized) {
        throw new Error("Ошибка инициализации базы данных")
      }

      const tgWebAppAvailable = Boolean(window.Telegram?.WebApp)
      console.log("Telegram WebApp available:", tgWebAppAvailable)

      setDebugInfo((prev) => ({
        ...prev,
        telegramWebAppAvailable: tgWebAppAvailable,
      }))

      if (!tgWebAppAvailable) {
        throw new Error("Telegram WebApp не доступен")
      }

      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const userId = tg.initDataUnsafe?.user?.id
      const username = tg.initDataUnsafe?.user?.username

      setDebugInfo((prev) => ({
        ...prev,
        initDataReceived: Boolean(userId),
        userId: userId,
      }))

      if (!userId) {
        throw new Error("Не удалось получить ID пользователя")
      }

      // Пытаемся получить данные пользователя
      let userData = await getUserData(userId)

      // Если пользователя нет, создаем его
      if (!userData) {
        console.log("Creating new user...")
        userData = await createUser(userId, username)
      }

      setUser(userData)
      console.log("App initialization completed")
    } catch (err) {
      console.error("Initialization error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function mine() {
    if (miningCooldown || !user) return

    setMiningCooldown(true)
    try {
      console.log("Starting mining...")
      const minedAmount = user.mining_power
      const expGained = Math.floor(minedAmount * 0.1)

      // Обновляем данные в базе
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          balance: user.balance + minedAmount,
          experience: user.experience + expGained,
          last_mining: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Записываем транзакцию
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: minedAmount,
          type: "mining",
          description: "Майнинг криптовалюты",
        },
      ])

      if (transactionError) throw transactionError

      setUser(updatedUser)
      console.log("Mining completed successfully")

      // Проверяем повышение уровня
      if (updatedUser.experience >= updatedUser.next_level_exp) {
        await levelUp()
      }

      setTimeout(() => {
        setMiningCooldown(false)
      }, 3000)
    } catch (err) {
      console.error("Mining error:", err)
      setError("Ошибка при майнинге: " + err.message)
      setMiningCooldown(false)
    }
  }

  async function levelUp() {
    try {
      console.log("Starting level up...")
      const { data: levelData, error: levelError } = await supabase
        .from("levels")
        .select("*")
        .eq("level", user.level + 1)
        .single()

      if (levelError) throw levelError

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          level: user.level + 1,
          experience: 0,
          next_level_exp: levelData.exp_required,
          balance: user.balance + levelData.reward,
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setUser(updatedUser)
      console.log("Level up completed successfully")

      // Записываем транзакцию награды за уровень
      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: levelData.reward,
          type: "level_up",
          description: `Награда за достижение ${updatedUser.level} уровня`,
        },
      ])
    } catch (err) {
      console.error("Level up error:", err)
      setError("Ошибка при повышении уровня: " + err.message)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1b1e",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        Загрузка...
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
        <div
          style={{
            background: "rgba(255, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <h3>Ошибка</h3>
          <p>{error}</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Попробовать снова
        </button>

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <div>База данных: {debugInfo.databaseConnected ? "Подключена" : "Ошибка подключения"}</div>
          <div>Telegram WebApp: {debugInfo.telegramWebAppAvailable ? "Доступен" : "Недоступен"}</div>
          <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
          <div>База данных инициализирована: {debugInfo.databaseInitialized ? "Да" : "Нет"}</div>
        </div>
      </div>
    )
  }

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
      {/* Статистика */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Статистика</h2>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: "#888" }}>Баланс:</div>
          <div style={{ fontSize: "24px" }}>{user?.balance?.toFixed(2)} 💰</div>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: "#888" }}>Мощность майнинга:</div>
          <div style={{ fontSize: "24px" }}>{user?.mining_power?.toFixed(2)} ⚡</div>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: "#888" }}>Уровень:</div>
          <div style={{ fontSize: "24px" }}>{user?.level || 1} 🏆</div>
        </div>
      </div>

      {/* Кнопка майнинга */}
      <button
        onClick={mine}
        disabled={miningCooldown}
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: miningCooldown ? "#666" : "#3b82f6",
          border: "none",
          borderRadius: "12px",
          cursor: miningCooldown ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {miningCooldown ? "Майнинг..." : "Майнить"}
      </button>

      {/* Прогресс уровня */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <div style={{ color: "#888", marginBottom: "10px" }}>Прогресс уровня:</div>
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(user?.experience / user?.next_level_exp) * 100}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "5px",
            fontSize: "14px",
            color: "#888",
          }}
        >
          {user?.experience || 0} / {user?.next_level_exp || 100} XP
        </div>
      </div>

      {/* Отладочная информация */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <div>База данных: {debugInfo.databaseConnected ? "Подключена" : "Ошибка подключения"}</div>
        <div>Telegram WebApp: {debugInfo.telegramWebAppAvailable ? "Доступен" : "Недоступен"}</div>
        <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
        <div>База данных инициализирована: {debugInfo.databaseInitialized ? "Да" : "Нет"}</div>
      </div>
    </div>
  )
}

export default App

