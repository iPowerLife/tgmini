"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Task {
  id: number
  title: string
  description: string
  reward: number
  type: string
  is_completed: boolean
  is_claimed: boolean
  required_referrals?: number
}

interface User {
  referral_count?: number
}

interface TaskCardProps {
  task: Task
  user?: User
  onClaim: (taskId: number) => Promise<void>
}

const TaskCard: React.FC<TaskCardProps> = ({ task, user, onClaim }) => {
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await onClaim(task.id)
    } catch (error) {
      console.error("Failed to claim task:", error)
    } finally {
      setClaiming(false)
    }
  }

  const renderClaimButton = () => {
    // Для реферальных заданий
    if (task.type === "referral") {
      const referralCount = user?.referral_count || 0
      const requiredReferrals = task.required_referrals || Number.parseInt(task.title.match(/\d+/)?.[0] || "0")

      console.log("Referral task debug:", {
        taskId: task.id,
        referralCount,
        requiredReferrals,
        isCompleted: referralCount >= requiredReferrals,
        isClaimed: task.is_claimed,
      })

      if (referralCount >= requiredReferrals && !task.is_claimed) {
        return (
          <Button onClick={handleClaim} disabled={claiming} variant="contained" className="w-full mt-4">
            {claiming ? "Получение..." : "Получить награду"}
          </Button>
        )
      }
    }

    // Для других типов заданий
    if (task.is_completed && !task.is_claimed) {
      return (
        <Button onClick={handleClaim} disabled={claiming} variant="contained" className="w-full mt-4">
          {claiming ? "Получение..." : "Получить награду"}
        </Button>
      )
    }

    return null
  }

  console.log("Task card render:", {
    taskId: task.id,
    type: task.type,
    title: task.title,
    userReferralCount: user?.referral_count,
    taskRequiredReferrals: task.required_referrals,
    isCompleted: task.is_completed,
    isClaimed: task.is_claimed,
  })

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-500">{task.description}</p>
      <p className="mt-2">Reward: {task.reward}</p>
      {renderClaimButton()}
    </div>
  )
}

export default TaskCard

