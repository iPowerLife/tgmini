import { supabase } from "../supabase"

export async function getDailyBonusInfo(userId) {
  try {
    const { data, error } = await supabase
      .from("daily_bonuses")
      .select("*, claimed_at")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching daily bonus info:", error)
      return null
    }

    return data || { canClaim: true, lastClaim: null, streak: 0 }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return null
  }
}

export async function claimDailyBonus(userId, amount) {
  try {
    const { data: currentUser, error: getUserError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (getUserError) {
      console.error("Error getting user balance:", getUserError)
      throw getUserError
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .update({
        balance: currentUser.balance + amount,
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) {
      console.error("Error updating user balance:", userError)
      throw userError
    }

    const { error: bonusError } = await supabase.from("daily_bonuses").insert([
      {
        user_id: userId,
        amount: amount,
        streak: 1,
        claimed_at: new Date().toISOString(),
      },
    ])

    if (bonusError) {
      console.error("Error recording bonus:", bonusError)
      await supabase
        .from("users")
        .update({
          balance: currentUser.balance,
        })
        .eq("id", userId)
      throw bonusError
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error in claimDailyBonus:", error)
    return { success: false, error: error.message }
  }
}

