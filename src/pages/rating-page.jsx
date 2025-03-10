"use client"

import { useState } from "react"
import { RatingList } from "../components/rating-list"

const RatingPage = ({ user, initialData }) => {
  const [activeTab, setActiveTab] = useState("balance")

  // Обработчик смены вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Выводим данные для отладки
  console.log("RatingPage render with:", {
    user,
    initialData,
    activeTab,
  })

  return (
    <div className="min-h-screen">
      <RatingList currentUserId={user?.id} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default RatingPage

