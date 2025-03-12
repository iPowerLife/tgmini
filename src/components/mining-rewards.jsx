"use client"

import { useState, useEffect } from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "../utils/supabaseClient"

const MiningRewards = () => {
  const user = useUser()
  const [rewards, setRewards] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRewards = async () => {
      if (user) {
        try {
          const userId = user.id
          const { data, error } = await supabase.from("mining_rewards").select("amount,user_id").eq("user_id", userId)

          if (error) {
            console.error("Error fetching mining rewards:", error)
          } else {
            if (data && data.length > 0) {
              let totalRewards = 0
              data.forEach((item) => {
                totalRewards += item.amount
              })
              setRewards(totalRewards)
            } else {
              setRewards(0)
            }
          }
        } catch (error) {
          console.error("Unexpected error fetching mining rewards:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchRewards()
  }, [user])

  const collectRewards = async () => {
    if (user) {
      try {
        const userId = user.id
        const { data, error } = await supabase.from("mining_rewards").select("amount").eq("user_id", userId)

        if (error) {
          console.error("Error collecting mining rewards:", error)
        } else {
          // Assuming the function clears the rewards upon collection
          setRewards(0)
          // Optionally, refresh the data after collection
          const { data: newData, error: newError } = await supabase
            .from("mining_rewards")
            .select("amount,user_id")
            .eq("user_id", userId)

          if (newError) {
            console.error("Error refetching mining rewards:", newError)
          } else {
            if (newData && newData.length > 0) {
              let totalRewards = 0
              newData.forEach((item) => {
                totalRewards += item.amount
              })
              setRewards(totalRewards)
            } else {
              setRewards(0)
            }
          }
        }
      } catch (error) {
        console.error("Unexpected error collecting mining rewards:", error)
      }
    }
  }

  if (loading) {
    return <p>Loading mining rewards...</p>
  }

  return (
    <div>
      <h3>Mining Rewards</h3>
      <p>Your current mining rewards: {rewards}</p>
      <button onClick={collectRewards} disabled={rewards === 0}>
        Collect Rewards
      </button>
    </div>
  )
}

export default MiningRewards

