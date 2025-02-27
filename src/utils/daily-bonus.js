import { supabase } from "../supabase"

export async function claimDailyBonus(userId, amount) {
  try {
    console.log("Claiming daily bonus:", { userId, amount })

    const { data, error } = await supabase.rpc("claim_daily_bonus", {
      user_id_param: userId,
      bonus_amount: amount,
    })

    console.log("Claim result:", { data, error })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.success) {
      throw new Error(data.error)
    }

    return data
  } catch (error) {
    console.error("Error claiming bonus:", error)
    return {
      success: false,
      error: error.message || "Неизвестная ошибка",
    }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: lastBonus, error } = await supabase
      .from("daily_bonuses")
      .select("claimed_at")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error getting bonus info:", error)
      return { canClaim: false, lastClaim: null, streak: 0 }
    }

    const canClaim = !lastBonus || new Date(lastBonus.claimed_at).setHours(0, 0, 0, 0) < today.getTime()

    return {
      canClaim,
      lastClaim: lastBonus?.claimed_at || null,
      streak: 0, // Упростим пока логику серии
    }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return { canClaim: true, lastClaim: null, streak: 0 }
  }
}

