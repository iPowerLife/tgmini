import { supabase } from "../supabase"

export async function getDailyBonusInfo(userId) {
  try {
    // Получаем последний полученный бонус
    const { data: lastBonus } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (!lastBonus) {
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    const now = new Date()
    const lastClaim = new Date(lastBonus.claimed_at)
    const daysSinceLastClaim = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24))

    // Проверяем, можно ли получить бонус
    const canClaim = daysSinceLastClaim >= 1

    // Проверяем, не прервалась ли серия
    const streak = daysSinceLastClaim === 1 ? lastBonus.streak : 0

    return {
      canClaim,
      streak,
      lastClaim: lastBonus.claimed_at,
    }
  } catch (error) {
    console.error("Error getting daily bonus info:", error)
    return { canClaim: false, streak: 0, lastClaim: null }
  }
}

export async function claimDailyBonus(userId, amount) {
  try {
    const { data: bonusInfo } = await getDailyBonusInfo(userId)

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

    if (bonusError) throw bonusError

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

    // Логируем транзакцию
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: amount,
        type: "daily_bonus",
        description: `Ежедневный бонус (День ${bonusInfo.streak + 1})`,
      },
    ])

    return { success: true, user, bonus }
  } catch (error) {
    console.error("Error claiming daily bonus:", error)
    return { success: false, error: error.message }
  }
}

