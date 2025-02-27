"use client"

import React from "react"
import { Stats } from "./components/Stats"
import { MiningButton } from "./components/MiningButton"

function App() {
  const [user, setUser] = React.useState({
    balance: 0,
    miningPower: 1,
    level: 1,
    experience: 0,
    nextLevelExp: 100,
  })

  const [isMining, setIsMining] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  // Функция майнинга
  const mine = async () => {
    if (isMining || cooldown > 0) return

    setIsMining(true)
    setCooldown(3)

    try {
      // Здесь будет логика взаимодействия с базой данных
      const minedAmount = user.miningPower
      const expGained = Math.floor(minedAmount * 0.1)

      setUser((prev) => ({
        ...prev,
        balance: prev.balance + minedAmount,
        experience: prev.experience + expGained,
      }))

      // Анимация добычи
      // TODO: Добавить визуальный эффект
    } catch (error) {
      console.error("Mining error:", error)
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
        miningPower={user.miningPower}
        level={user.level}
        experience={user.experience}
        nextLevelExp={user.nextLevelExp}
      />

      <MiningButton onMine={mine} cooldown={cooldown} isCooldown={cooldown > 0} />
    </div>
  )
}

export default App

