"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

// Хук для проверки наличия Miner Pass у пользователя
export function useMinerPass(userId) {
  const [hasMinerPass, setHasMinerPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function checkMinerPass() {
      try {
        setLoading(true)

        const { data, error } = await supabase.rpc("has_miner_pass", { user_id_param: userId })

        if (error) throw error

        setHasMinerPass(data || false)
      } catch (err) {
        console.error("Error checking Miner Pass:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    checkMinerPass()
  }, [userId])

  return { hasMinerPass, loading, error }
}

