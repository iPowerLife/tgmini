"use client"

import { useState, useEffect, useRef } from "react"
import { RatingSection } from "../components/rating-section"
import { supabase } from "../supabase"

const RatingPage = ({ user, initialData }) => {
  const [loading, setLoading] = useState(!initialData)
  const [ratingData, setRatingData] = useState(initialData || null)
  const isComponentMounted = useRef(true)

  // Загрузка данных рейтинга, если они не были переданы
  useEffect(() => {
    isComponentMounted.current = true

    // Если данные уже переданы через props, не загружаем их снова
    if (initialData) {
      return
    }

    const loadRatingData = async () => {
      try {
        setLoading(true)

        // Загружаем данные рейтинга
        const { data, error } = await supabase.rpc("get_users_rating")

        if (!isComponentMounted.current) return
        if (error) throw error

        setRatingData({ users: data || [] })
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
      <RatingSection currentUserId={user?.id} initialData={ratingData?.users} />
    </div>
  )
}

export default RatingPage

