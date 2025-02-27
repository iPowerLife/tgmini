import { supabase } from "../supabase"

export async function getDailyBonusInfo(userId) {
  try {
    console.log("Getting daily bonus info for user:", userId)

    // Получаем последнюю запись о бонусе пользователя
    const { data: lastBonus, error: lastBonusError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .single()

    if (lastBonusError && lastBonusError.code !== "404") {
      console.error("Error fetching last bonus:", lastBonusError)
      throw new Error("Ошибка получения информации о последнем бонусе")
    }

    const now = new Date()
    const lastClaimed = lastBonus ? new Date(lastBonus.claimed_at) : null

    // Проверяем, можно ли получить бонус сегодня
    let canClaim = true
    if (lastClaimed) {
      const nextClaim = new Date(lastClaimed)
      nextClaim.setDate(nextClaim.getDate() + 1)
      nextClaim.setHours(0, 0, 0, 0) // Обнуляем время для сравнения дат
      canClaim = now >= nextClaim
    }

    // Рассчитываем серию
    let streak = 0
    if (lastClaimed) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const lastClaimedYesterday = new Date(lastClaimed)
      lastClaimedYesterday.setHours(0, 0, 0, 0)

      if (lastClaimedYesterday.getTime() === yesterday.getTime()) {
        streak = 1 // Просто пример, логику серии нужно доработать
      }
    }

    console.log("Daily bonus info:", { canClaim, lastClaimed, streak })

    return {
      canClaim: canClaim,
      lastClaim: lastClaimed ? lastClaimed.toISOString() : null,
      streak: streak,
    }
  } catch (error) {
    console.error("Error in getDailyBonusInfo:", error)
    return {
      canClaim: false,
      lastClaim: null,
      streak: 0,
    }
  }
}

export async function claimDailyBonus(userId, amount) {
  console.log("=== Starting claimDailyBonus ===")
  console.log("Input:", { userId, amount })

  try {
    // 1. Проверяем существование пользователя
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.error("User check failed:", userError)
      throw new Error("Пользователь не найден")
    }

    console.log("User found:", user)

    // 2. Проверяем, не получал ли уже бонус сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingBonus, error: checkError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .gte("claimed_at", today.toISOString())
      .limit(1)

    if (checkError) {
      console.error("Bonus check failed:", checkError)
      throw new Error("Ошибка проверки бонуса")
    }

    if (existingBonus?.length > 0) {
      console.log("Bonus already claimed today")
      throw new Error("Бонус уже получен сегодня")
    }

    // 3. Добавляем запись о бонусе
    const { data: bonus, error: insertError } = await supabase
      .from("daily_bonuses")
      .insert([
        {
          user_id: userId,
          amount: amount,
          claimed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Bonus insert failed:", insertError)
      throw new Error("Не удалось записать бонус")
    }

    console.log("Bonus inserted:", bonus)

    // 4. Обновляем баланс пользователя
    const newBalance = Number(user.balance) + Number(amount)

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Balance update failed:", updateError)
      // Удаляем запись о бонусе при ошибке
      await supabase.from("daily_bonuses").delete().eq("id", bonus.id)
      throw new Error("Не удалось обновить баланс")
    }

    console.log("Balance updated:", updatedUser)
    console.log("=== claimDailyBonus completed successfully ===")

    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    console.error("=== claimDailyBonus failed ===")
    console.error("Error:", error)
    return {
      success: false,
      error: error.message || "Неизвестная ошибка",
    }
  }
}

