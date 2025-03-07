"use client"

import { memo } from "react"

const categoryColors = {
  basic: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  limited: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  achievement: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
  },
  referral: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
  },
  daily: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
  },
}

const categoryIcons = {
  basic: "🔄",
  limited: "⏱️",
  achievement: "🏆",
  referral: "👥",
  daily: "📅",
}

export const TaskCategoryBadge = memo(function TaskCategoryBadge({ type, small = false }) {
  const colors = categoryColors[type] || categoryColors.basic
  const icon = categoryIcons[type] || "🔄"

  const displayName =
    {
      basic: "Базовое",
      limited: "Ограниченное",
      achievement: "Достижение",
      referral: "Реферальное",
      daily: "Ежедневное",
    }[type] || "Задание"

  if (small) {
    return (
      <div className={`inline-flex items-center px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.border} border`}>
        <span className={`text-xs ${colors.text}`}>{icon}</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md ${colors.bg} ${colors.border} border`}>
      <span className={`text-xs ${colors.text} mr-1`}>{icon}</span>
      <span className={`text-xs ${colors.text}`}>{displayName}</span>
    </div>
  )
})

