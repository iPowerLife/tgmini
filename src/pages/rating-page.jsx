"use client"

import { useState } from "react"
import { OptimizedRatingList } from "../components/optimized-rating-list"

const RatingPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState("balance")

  // Обработчик смены вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen">
      <OptimizedRatingList currentUserId={user?.id} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default RatingPage

