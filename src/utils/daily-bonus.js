import { supabase } from "../supabase"

export async function claimDailyBonus(userId) {
  try {
    console.log("Starting daily bonus claim for user:", userId)

    // Проверяем входные данные
    if (!userId) {
      console.error("No user ID provided")
      return {
        success: false,
        error: "ID пользователя не указан",
      }
    }

    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return {
        success: false,
        error: "Ошибка получения данных пользователя",
      }
    }

    if (!user) {
      console.error("User not found:", userId)
      return {
        success: false,
        error: "Пользователь не найден",
      }
    }

    console.log("User found:", user)

    // Проверяем, получал ли пользователь бонус сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingBonus, error: bonusCheckError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .gte("claimed_at", today.toISOString())
      .limit(1)

    if (bonusCheckError) {
      console.error("Error checking existing bonus:", bonusCheckError)
      return {
        success: false,
        error: "Ошибка проверки бонуса",
      }
    }

    console.log("Existing bonus check:", existingBonus)

    if (existingBonus && existingBonus.length > 0) {
      console.log("Bonus already claimed today")
      return {
        success: false,
        error: "Бонус уже получен сегодня",
      }
    }

    // Вызываем функцию получения бонуса
    console.log("Calling claim_daily_bonus function")
    const { data: result, error: claimError } = await supabase.rpc("claim_daily_bonus", {
      user_id_param: userId,
    })

    if (claimError) {
      console.error("Error claiming bonus:", claimError)
      return {
        success: false,
        error: "Ошибка получения бонуса: " + claimError.message,
      }
    }

    console.log("Claim result:", result)
    return result
  } catch (error) {
    console.error("Unexpected error in claimDailyBonus:", error)
    return {
      success: false,
      error: "Непредвиденная ошибка: " + error.message,
    }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    console.log("Getting daily bonus info for user:", userId)
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

    console.log("Last bonus data:", lastBonus)

    const canClaim = !lastBonus || new Date(lastBonus.claimed_at) < today
    const isWeekend = today.getDay() === 0 || today.getDay() === 6

    const result = {
      canClaim,
      lastClaim: lastBonus?.claimed_at || null,
      streak: lastBonus?.streak || 0,
      isWeekend,
    }

    console.log("Bonus info result:", result)
    return result
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

