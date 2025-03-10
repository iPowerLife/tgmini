"use client"

import { useState } from "react"
import { RatingList } from "../components/rating-list"

const RatingPage = ({ initialData, user }) => {
  const [activeTab, setActiveTab] = useState("balance")

  // Обработчик смены вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Выводим данные для отладки
  console.log("RatingPage initialData:", initialData)
  console.log("RatingPage user:", user)

  return (
    <div className="min-h-screen">
      <RatingList
        users={initialData?.users || []}
        currentUserId={user?.id}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}

export default RatingPage

