import { supabase } from "../supabase"

export async function claimDailyBonus(userId, amount) {
  try {
    console.log("Starting daily bonus claim:", { userId, amount })

    // Начинаем транзакцию
    const { error: beginError } = await supabase.rpc("begin_transaction")
    if (beginError) throw beginError

    try {
      // Обновляем баланс пользователя
      const { data: user, error: userError } = await supabase
        .from("users")
        .update({
          balance: supabase.raw(`balance + ${amount}`),
        })
        .eq("id", userId)
        .select()
        .single()

      if (userError) throw userError
      console.log("Updated user balance:", user)

      // Записываем бонус
      const { data: bonus, error: bonusError } = await supabase
        .from("daily_bonuses")
        .insert([
          {
            user_id: userId,
            amount: amount,
            streak: 1, // Начинаем новую серию
            claimed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (bonusError) throw bonusError
      console.log("Recorded bonus:", bonus)

      // Записываем транзакцию
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          user_id: userId,
          amount: amount,
          type: "daily_bonus",
          description: "Ежедневный бонус",
        },
      ])

      if (transactionError) throw transactionError
      console.log("Recorded transaction")

      // Завершаем транзакцию
      const { error: commitError } = await supabase.rpc("commit_transaction")
      if (commitError) throw commitError

      console.log("Daily bonus claimed successfully")
      return { success: true, user }
    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      const { error: rollbackError } = await supabase.rpc("rollback_transaction")
      if (rollbackError) console.error("Rollback error:", rollbackError)
      throw error
    }
  } catch (error) {
    console.error("Error in claimDailyBonus:", error)
    return { success: false, error: error.message }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    console.log("Getting daily bonus info for user:", userId)

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

    if (!lastBonus) {
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    const now = new Date()
    const lastClaim = new Date(lastBonus.claimed_at)

    // Сбрасываем время до начала дня для корректного сравнения
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastClaimDay = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate())

    const daysSinceLastClaim = Math.floor((today - lastClaimDay) / (1000 * 60 * 60 * 24))
    console.log("Days since last claim:", daysSinceLastClaim)

    return {
      canClaim: daysSinceLastClaim >= 1,
      streak: daysSinceLastClaim === 1 ? lastBonus.streak : 0,
      lastClaim: lastBonus.claimed_at,
    }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return { canClaim: true, streak: 0, lastClaim: null }
  }
}

