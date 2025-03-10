"use client"
import dynamic from "next/dynamic"

// Динамически импортируем компонент рейтинга с отключенным SSR
const RatingSection = dynamic(() => import("../../components/rating-section"), { ssr: false })

// Компонент-заглушка для загрузки
const LoadingFallback = () => (
  <div className="loading-state">
    <div className="spinner"></div>
    <p>Загрузка рейтинга...</p>
  </div>
)

export default function RatingPage() {
  return (
    <div className="rating-page">
      <h1>Страница рейтинга</h1>
    </div>
  )
}

