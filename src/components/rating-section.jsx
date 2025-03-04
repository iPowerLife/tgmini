"use client"

// Типы рейтингов
const RATING_TYPES = {
  MINING: "mining",
  REFERRALS: "referrals",
  LEVEL: "level",
  TASKS: "tasks",
}

// Названия рейтингов
const RATING_LABELS = {
  [RATING_TYPES.MINING]: "Майнинг",
  [RATING_TYPES.REFERRALS]: "Рефералы",
  [RATING_TYPES.LEVEL]: "Уровень",
  [RATING_TYPES.TASKS]: "Задания",
}

// Иконки для рейтингов
const RATING_ICONS = {
  [RATING_TYPES.MINING]: "⛏️",
  [RATING_TYPES.REFERRALS]: "👥",
  [RATING_TYPES.LEVEL]: "🏆",
  [RATING_TYPES.TASKS]: "✅",
}

// Цвета для топ-3 позиций
const POSITION_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"]

// Количество элементов на странице
const ITEMS_PER_PAGE = 20

function RatingSection() {
  return (
    <div className="rating-section">
      <h1>Рейтинг</h1>
      <p>Базовая версия</p>
    </div>
  )
}

export default RatingSection

