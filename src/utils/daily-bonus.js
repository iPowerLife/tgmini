import { supabase } from "../supabase"

export async function claimDailyBonus(userId) {
  console.log("Starting claimDailyBonus for userId:", userId)

  try {
    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error checking user:", userError)
      return {
        success: false,
        error: "Ошибка проверки пользователя: " + userError.message,
      }
    }

    if (!user) {
      console.error("User not found")
      return {
        success: false,
        error: "Пользователь не найден",
      }
    }

    console.log("Found user:", user)

    // Проверяем, получал ли пользователь бонус сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingBonus, error: existingBonusError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .gte("claimed_at", today.toISOString())
      .limit(1)
      .single()

    if (existingBonusError && existingBonusError.code !== "PGRST116") {
      console.error("Error checking existing bonus:", existingBonusError)
      return {
        success: false,
        error: "Ошибка проверки существующего бонуса: " + existingBonusError.message,
      }
    }

    if (existingBonus) {
      console.log("Bonus already claimed today:", existingBonus)
      return {
        success: false,
        error: "Бонус уже получен сегодня",
      }
    }

    // Вызываем функцию получения бонуса
    console.log("Calling claim_daily_bonus function...")
    const { data, error } = await supabase.rpc("claim_daily_bonus", {
      user_id_param: userId,
    })

    console.log("Claim daily bonus response:", { data, error })

    if (error) {
      console.error("Error in claimDailyBonus:", error)
      return {
        success: false,
        error: "Ошибка получения бонуса: " + error.message,
      }
    }

    if (!data || !data.success) {
      console.error("Claim was not successful:", data?.error || "Unknown error")
      return {
        success: false,
        error: data?.error || "Неизвестная ошибка при получении бонуса",
      }
    }

    // Проверяем результат
    if (!data.user || !data.bonus) {
      console.error("Invalid response format:", data)
      return {
        success: false,
        error: "Некорректный формат ответа от сервера",
      }
    }

    console.log("Bonus claimed successfully:", data)
    return data
  } catch (error) {
    console.error("Unexpected error in claimDailyBonus:", error)
    return {
      success: false,
      error: "Непредвиденная ошибка: " + error.message,
    }
  }
}

export async function getDailyBonusInfo(userId) {
  console.log("Getting daily bonus info for userId:", userId)

  try {
    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error checking user:", userError)
      return {
        canClaim: false,
        lastClaim: null,
        streak: 0,
        nextBonus: null,
        isWeekend: false,
        error: "Ошибка проверки пользователя",
      }
    }

    if (!user) {
      console.error("User not found")
      return {
        canClaim: false,
        lastClaim: null,
        streak: 0,
        nextBonus: null,
        isWeekend: false,
        error: "Пользователь не найден",
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Получаем последний бонус
    const { data: lastBonus, error: bonusError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    console.log("Last bonus data:", { lastBonus, bonusError })

    // Для новых пользователей или когда нет бонусов
    if (bonusError && bonusError.code === "PGRST116") {
      console.log("No previous bonus found - new user or first claim")
      return {
        canClaim: true,
        lastClaim: null,
        streak: 0,
        nextBonus: null,
        isWeekend: today.getDay() === 0 || today.getDay() === 6,
      }
    }

    if (bonusError) {
      console.error("Error getting bonus info:", bonusError)
      return {
        canClaim: true,
        lastClaim: null,
        streak: 0,
        nextBonus: null,
        isWeekend: today.getDay() === 0 || today.getDay() === 6,
      }
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    const lastClaimDate = lastBonus ? new Date(lastBonus.claimed_at) : null
    const canClaim = !lastBonus || lastClaimDate.setHours(0, 0, 0, 0) < today.getTime()

    const result = {
      canClaim,
      lastClaim: lastBonus?.claimed_at || null,
      streak: lastBonus?.streak || 0,
      nextBonus: canClaim ? null : tomorrow.toISOString(),
      isWeekend,
    }

    console.log("Returning bonus info:", result)
    return result
  } catch (error) {
    console.error("Unexpected error in getDailyBonusInfo:", error)
    return {
      canClaim: true,
      lastClaim: null,
      streak: 0,
      nextBonus: null,
      isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
      error: "Непредвиденная ошибка",
    }
  }
}

