import { supabase } from "../supabase"

export async function claimDailyBonus(userId) {
  try {
    console.log("Claiming bonus for user:", userId)

    const { data, error } = await supabase.rpc("claim_daily_bonus", {
      user_id_param: userId,
    })

    console.log("Claim response:", { data, error })

    if (error) {
      console.error("Error claiming bonus:", error)
      return {
        success: false,
        error: "Ошибка при получении бонуса",
      }
    }

    return data
  } catch (error) {
    console.error("Error in claimDailyBonus:", error)
    return {
      success: false,
      error: "Произошла ошибка",
    }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: lastBonus, error } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error getting bonus info:", error)
    }

    const canClaim = !lastBonus || new Date(lastBonus.claimed_at) < today

    return {
      canClaim,
      lastClaim: lastBonus?.claimed_at || null,
      streak: 0,
      isWeekend: today.getDay() === 0 || today.getDay() === 6,
    }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return {
      canClaim: true,
      lastClaim: null,
      streak: 0,
      isWeekend: false,
    }
  }
}

