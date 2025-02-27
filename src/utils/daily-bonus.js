import { supabase } from "../supabase"

export async function claimDailyBonus(userId, amount) {
  try {
    console.log("Claiming daily bonus:", { userId, amount })

    // Проверяем, существует ли пользователь
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error checking user:", userError)
      throw new Error("Пользователь не найден")
    }

    // Проверяем, не получал ли пользователь бонус сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingBonus, error: checkError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .gte("claimed_at", today.toISOString())
      .limit(1)

    if (checkError) {
      console.error("Error checking existing bonus:", checkError)
      throw new Error("Ошибка проверки бонуса")
    }

    if (existingBonus?.length > 0) {
      throw new Error("Бонус уже получен сегодня")
    }

    // Обновляем баланс пользователя
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ balance: user.balance + amount })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating balance:", updateError)
      throw new Error("Ошибка обновления баланса")
    }

    // Записываем информацию о бонусе
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
      // Откатываем изменение баланса
      await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
      throw new Error("Ошибка записи бонуса")
    }

    console.log("Daily bonus claimed successfully")
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error in claimDailyBonus:", error)
    return {
      success: false,
      error: error.message || "Неизвестная ошибка",
    }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    console.log("Getting bonus info for user:", userId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching bonus info:", error)
      throw error
    }

    const lastBonus = data?.[0]
    if (!lastBonus) {
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    const lastClaimDate = new Date(lastBonus.claimed_at)
    lastClaimDate.setHours(0, 0, 0, 0)

    const canClaim = today.getTime() > lastClaimDate.getTime()
    const daysDiff = Math.floor((today - lastClaimDate) / (1000 * 60 * 60 * 24))

    return {
      canClaim,
      streak: daysDiff === 1 ? lastBonus.streak : 0,
      lastClaim: lastBonus.claimed_at,
    }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return { canClaim: true, streak: 0, lastClaim: null }
  }
}

