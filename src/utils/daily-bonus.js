import { supabase } from "../supabase"

export async function claimDailyBonus(userId) {
  console.log("Starting claimDailyBonus for userId:", userId)

  try {
    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      console.error("User not found:", userError)
      return {
        success: false,
        error: "Пользователь не найден",
      }
    }

    // Вызываем функцию получения бонуса
    const { data, error } = await supabase.rpc("claim_daily_bonus", {
      user_id_param: userId,
    })

    console.log("Claim daily bonus response:", { data, error })

    if (error) {
      console.error("Error in claimDailyBonus:", error)
      return {
        success: false,
        error: error.message || "Ошибка при получении бонуса",
      }
    }

    if (!data.success) {
      console.error("Claim was not successful:", data.error)
      return {
        success: false,
        error: data.error || "Не удалось получить бонус",
      }
    }

    // Обновляем информацию о пользователе в локальном хранилище или состоянии
    if (data.user) {
      try {
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()

        if (!updateError && updatedUser) {
          console.log("User data updated:", updatedUser)
        }
      } catch (updateError) {
        console.error("Error updating user data:", updateError)
      }
    }

    console.log("Bonus claimed successfully:", data)
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
  console.log("Getting daily bonus info for userId:", userId)

  try {
    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      console.error("User not found:", userError)
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
    const { data: lastBonus, error } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    console.log("Last bonus data:", { lastBonus, error })

    // Для новых пользователей или когда нет бонусов
    if (error && error.code === "PGRST116") {
      console.log("No previous bonus found - new user or first claim")
      return {
        canClaim: true,
        lastClaim: null,
        streak: 0,
        nextBonus: null,
        isWeekend: today.getDay() === 0 || today.getDay() === 6,
      }
    }

    if (error) {
      console.error("Error getting bonus info:", error)
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
    console.error("Error in getDailyBonusInfo:", error)
    // В случае ошибки разрешаем получить бонус
    return {
      canClaim: true,
      lastClaim: null,
      streak: 0,
      nextBonus: null,
      isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
    }
  }
}

