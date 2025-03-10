"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { RatingList } from "../components/rating-list" // Новый компонент, который мы создадим

const RatingPage = ({ user, initialData }) => {
  const [loading, setLoading] = useState(!initialData?.users)
  const [ratingData, setRatingData] = useState(initialData?.users || [])
  const [activeTab, setActiveTab] = useState("balance")
  const isComponentMounted = useRef(true)

  // Загрузка данных рейтинга, если они не были переданы
  useEffect(() => {
    isComponentMounted.current = true

    // Если данные уже переданы через props, не загружаем их снова
    if (initialData?.users && initialData.users.length > 0) {
      return
    }

    const loadRatingData = async () => {
      try {
        setLoading(true)

        // Загружаем данные рейтинга
        const { data, error } = await supabase.rpc("get_users_rating")

        if (!isComponentMounted.current) return
        if (error) throw error

        setRatingData(data || [])
      } catch (error) {
        console.error("Error loading rating data:", error)
      } finally {
        if (isComponentMounted.current) {
          setLoading(false)
        }
      }
    }

    loadRatingData()

    return () => {
      isComponentMounted.current = false
    }
  }, [initialData])

  // Обработчик смены вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <RatingList users={ratingData} currentUserId={user?.id} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default RatingPage

