"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, Typography, Button } from "@mui/material"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

interface Task {
  id: number
  title: string
  description: string
  reward: number
  is_completed: boolean
  is_claimed: boolean
  type: string
  required_referrals?: number
}

interface TaskCardProps {
  task: Task
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { user } = useAuth()
  const { claimReward } = useData()
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await claimReward(task.id)
    } catch (error) {
      console.error("Failed to claim reward:", error)
    } finally {
      setClaiming(false)
    }
  }

  const renderButton = () => {
    // For referral tasks
    if (task.type === "referral") {
      const referralCount = user?.referral_count || 0
      const requiredReferrals = task.required_referrals || Number.parseInt(task.title.match(/\d+/)?.[0] || "0")
      const isCompleted = referralCount >= requiredReferrals

      if (isCompleted && !task.is_claimed) {
        return (
          <Button onClick={handleClaim} disabled={claiming} className="w-full mt-4">
            {claiming ? "Получение..." : "Получить награду"}
          </Button>
        )
      }
    }

    // For other task types - keep existing logic
    if (task.is_completed && !task.is_claimed) {
      return (
        <Button onClick={handleClaim} disabled={claiming} className="w-full mt-4">
          {claiming ? "Получение..." : "Получить награду"}
        </Button>
      )
    }

    return null
  }

  console.log("Task:", {
    id: task.id,
    type: task.type,
    title: task.title,
    referralCount: user?.referral_count,
    requiredReferrals: task.required_referrals,
    isCompleted: task.is_completed,
    isClaimed: task.is_claimed,
  })

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2">{task.description}</Typography>
        <Typography variant="subtitle1">Reward: {task.reward} coins</Typography>
        {renderButton()}
      </CardContent>
    </Card>
  )
}

export default TaskCard

