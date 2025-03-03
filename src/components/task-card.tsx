"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

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

  const renderReferralProgress = () => {
    if (task.type === "referral") {
      const referralCount = user?.referral_count || 0
      const requiredReferrals = task.required_referrals || Number.parseInt(task.title.match(/\d+/)?.[0] || "0")
      const progress = Math.min((referralCount / requiredReferrals) * 100, 100)

      return (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">
            {referralCount} из {requiredReferrals}
          </div>
          <Progress value={progress} />
        </div>
      )
    }
    return null
  }

  const shouldShowClaimButton = () => {
    if (task.type === "referral") {
      const referralCount = user?.referral_count || 0
      const requiredReferrals = task.required_referrals || Number.parseInt(task.title.match(/\d+/)?.[0] || "0")
      return referralCount >= requiredReferrals && !task.is_claimed
    }
    return task.is_completed && !task.is_claimed
  }

  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-500">{task.description || "В процессе..."}</p>
        </div>
        <div className="text-lg font-semibold text-blue-500">{task.reward} 💎</div>
      </div>
      {renderReferralProgress()}
      {shouldShowClaimButton() && (
        <Button onClick={handleClaim} disabled={claiming} className="w-full mt-4">
          {claiming ? "Получение..." : "Получить награду"}
        </Button>
      )}
    </div>
  )
}

export default TaskCard

