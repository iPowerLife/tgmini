import { supabase } from "../supabase"

export async function getDailyBonusInfo(userId) {
  try {
    console.log("Getting daily bonus info for user:", userId)

    // Получаем последний полученный бонус
    const { data: lastBonus, error: bonusError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (bonusError && bonusError.code !== "PGRST116") {
      console.error("Error fetching last bonus:", bonusError)
      throw bonusError
    }

    console.log("Last bonus data:", lastBonus)

    if (!lastBonus) {
      console.log("No previous bonus found, can claim")
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    const now = new Date()
    const lastClaim = new Date(lastBonus.claimed_at)
    const daysSinceLastClaim = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24))

    console.log("Days since last claim:", daysSinceLastClaim)

    // Проверяем, можно ли получить бонус
    const canClaim = daysSinceLastClaim >= 1

    // Проверяем, не прервалась ли серия
    const streak = daysSinceLastClaim === 1 ? lastBonus.streak : 0

    console.log("Bonus info:", { canClaim, streak, lastClaim: lastBonus.claimed_at })
    return { canClaim, streak, lastClaim: lastBonus.claimed_at }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return { canClaim: false, streak: 0, lastClaim: null }
  }
}

export async function claimDailyBonus(userId, amount) {
  try {
    console.log("Claiming daily bonus:", { userId, amount })

    // Проверяем, можно ли получить бонус
    const bonusInfo = await getDailyBonusInfo(userId)
    console.log("Current bonus info:", bonusInfo)

    if (!bonusInfo.canClaim) {
      console.log("Cannot claim bonus yet")
      return { success: false, error: "Бонус уже получен сегодня" }
    }

    // Начинаем транзакцию
    const { data: bonus, error: bonusError } = await supabase
      .from("daily_bonuses")
      .insert([
        {
          user_id: userId,
          amount: amount,
          streak: bonusInfo.streak + 1,
        },
      ])
      .select()
      .single()

    if (bonusError) {
      console.error("Error inserting bonus:", bonusError)
      throw bonusError
    }

    console.log("Bonus recorded:", bonus)

    // Обновляем баланс пользователя
    const { data: user, error: userError } = await supabase
      .from("users")
      .update({
        balance: supabase.raw(`balance + ${amount}`),
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) {
      console.error("Error updating user balance:", userError)
      throw userError
    }

    console.log("User balance updated:", user)

    // Логируем транзакцию
    const { error: transactionError } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: amount,
        type: "daily_bonus",
        description: `Ежедневный бонус (День ${bonusInfo.streak + 1})`,
      },
    ])

    if (transactionError) {
      console.error("Error logging transaction:", transactionError)
      throw transactionError
    }

    console.log("Daily bonus claimed successfully")
    return { success: true, user, bonus }
  } catch (error) {
    console.error("Error in claimDailyBonus:", error)
    return { success: false, error: error.message }
  }
}

