"use client"

import React from "react"
import { supabase } from "./supabase"

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
  })

  React.useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      const tgWebAppAvailable = Boolean(window.Telegram?.WebApp)
      console.log("Telegram WebApp available:", tgWebAppAvailable)

      setDebugInfo((prev) => ({
        ...prev,
        telegramWebAppAvailable: tgWebAppAvailable,
      }))

      if (tgWebAppAvailable) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        const userId = tg.initDataUnsafe?.user?.id
        setDebugInfo((prev) => ({
          ...prev,
          initDataReceived: Boolean(userId),
          userId: userId,
        }))

        if (userId) {
          await loadUserData(userId)
        }
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadUserData(telegramId) {
    try {
      // Получаем данные пользователя
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegramId)
        .single()

      if (userError) throw userError

      // Если пользователя нет, создаем его
      if (!userData) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([
            {
              telegram_id: telegramId,
              balance: 0,
              mining_power: 1,
              level: 1,
              experience: 0,
              next_level_exp: 100,
            },
          ])
          .select()
          .single()

        if (createError) throw createError
        userData = newUser
      }

      setUser(userData)
    } catch (err) {
      console.error("Error loading user data:", err)
      setError("Ошибка загрузки данных пользователя")
    }
  }

  async function mine() {
    if (miningCooldown || !user) return

    setMiningCooldown(true)
    try {
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

      // Проверяем повышение уровня
      if (updatedUser.experience >= updatedUser.next_level_exp) {
        await levelUp()
      }

      setTimeout(() => {
        setMiningCooldown(false)
      }, 3000)
    } catch (err) {
      console.error("Mining error:", err)
      setError("Ошибка при майнинге")
      setMiningCooldown(false)
    }
  }

  async function levelUp() {
    try {
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
      setError("Ошибка при повышении уровня")
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
        <div>Текущий хост: {debugInfo.host}</div>
        <div>Telegram WebApp доступен: {debugInfo.telegramWebAppAvailable ? "Да" : "Нет"}</div>
        <div>Данные получены: {debugInfo.initDataReceived ? "Да" : "Нет"}</div>
        <div>ID пользователя: {debugInfo.userId || "Нет"}</div>
      </div>
    </div>
  )
}

export default App

