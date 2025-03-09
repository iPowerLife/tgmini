"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export function DebugDailyReward({ userId }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const testClaimReward = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      console.log("Testing claim_daily_reward for user:", userId)

      // Прямой вызов RPC функции
      const { data, error } = await supabase.rpc("claim_daily_reward", {
        user_id_param: userId,
      })

      console.log("Raw response:", { data, error })

      if (error) {
        console.error("Error:", error)
        setError(`${error.message || "Unknown error"}\n${error.details || ""}\n${error.hint || ""}`)
        return
      }

      setResult(data)
    } catch (err) {
      console.error("Exception:", err)
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const resetUserProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      console.log("Resetting user progress for:", userId)

      // Вызов функции сброса прогресса
      const { data, error } = await supabase.rpc("reset_daily_reward_for_testing", {
        user_id_param: userId,
      })

      console.log("Reset response:", { data, error })

      if (error) {
        console.error("Error:", error)
        setError(`${error.message || "Unknown error"}\n${error.details || ""}\n${error.hint || ""}`)
        return
      }

      setResult({ reset: true, message: "User progress reset successfully" })
    } catch (err) {
      console.error("Exception:", err)
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const checkUserProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      console.log("Checking user progress for:", userId)

      // Получаем прогресс пользователя
      const { data, error } = await supabase.from("user_daily_rewards").select("*").eq("user_id", userId).single()

      console.log("Progress response:", { data, error })

      if (error && error.code !== "PGRST116") {
        console.error("Error:", error)
        setError(`${error.message || "Unknown error"}\n${error.details || ""}\n${error.hint || ""}`)
        return
      }

      if (data) {
        setResult({ progress: data })
      } else {
        setResult({ progress: null, message: "No progress found for this user" })
      }
    } catch (err) {
      console.error("Exception:", err)
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#242838] rounded-xl p-4 border border-[#2A3142]/70 mb-4">
      <h2 className="text-lg font-bold mb-2">Отладка ежедневных наград</h2>
      <p className="text-sm text-gray-400 mb-4">ID пользователя: {userId || "Не указан"}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testClaimReward}
          disabled={loading || !userId}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-600 disabled:text-gray-400"
        >
          {loading ? "Загрузка..." : "Тест получения награды"}
        </button>

        <button
          onClick={resetUserProgress}
          disabled={loading || !userId}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-600 disabled:text-gray-400"
        >
          {loading ? "Загрузка..." : "Сбросить прогресс"}
        </button>

        <button
          onClick={checkUserProgress}
          disabled={loading || !userId}
          className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-600 disabled:text-gray-400"
        >
          {loading ? "Загрузка..." : "Проверить прогресс"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <h3 className="text-red-400 font-medium mb-1">Ошибка:</h3>
          <pre className="text-xs text-red-300 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <h3 className="text-blue-400 font-medium mb-1">Результат:</h3>
          <pre className="text-xs text-blue-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

