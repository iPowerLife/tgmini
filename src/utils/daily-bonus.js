import { supabase } from "../supabase"

export async function claimDailyBonus(userId, amount) {
  try {
    console.log("Начинаем получение бонуса:", { userId, amount })

    // Проверяем, получал ли пользователь бонус сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayBonus, error: checkError } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .gte("claimed_at", today.toISOString())
      .limit(1)

    console.log("Проверка существующего бонуса:", { todayBonus, checkError })

    if (checkError) {
      console.error("Ошибка проверки бонуса:", checkError)
      throw new Error("Не удалось проверить бонус")
    }

    if (todayBonus && todayBonus.length > 0) {
      throw new Error("Бонус уже получен сегодня")
    }

    // Получаем текущий баланс пользователя
    const { data: currentUser, error: getUserError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    console.log("Получение текущего баланса:", { currentUser, getUserError })

    if (getUserError) {
      console.error("Ошибка получения баланса:", getUserError)
      throw new Error("Не удалось получить баланс")
    }

    // Записываем бонус
    const { data: bonus, error: bonusError } = await supabase
      .from("daily_bonuses")
      .insert({
        user_id: userId,
        amount: amount,
      })
      .select()
      .single()

    console.log("Запись бонуса:", { bonus, bonusError })

    if (bonusError) {
      console.error("Ошибка записи бонуса:", bonusError)
      throw new Error("Не удалось записать бонус")
    }

    // Обновляем баланс пользователя
    const newBalance = Number(currentUser.balance) + Number(amount)
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId)
      .select()
      .single()

    console.log("Обновление баланса:", { updatedUser, updateError })

    if (updateError) {
      console.error("Ошибка обновления баланса:", updateError)
      // Удаляем запись о бонусе, так как не удалось обновить баланс
      await supabase.from("daily_bonuses").delete().eq("id", bonus.id)
      throw new Error("Не удалось обновить баланс")
    }

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Ошибка в claimDailyBonus:", error)
    return {
      success: false,
      error: error.message || "Неизвестная ошибка",
    }
  }
}

export async function getDailyBonusInfo(userId) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: bonuses, error } = await supabase
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(2)

    console.log("Получение информации о бонусах:", { bonuses, error })

    if (error) {
      console.error("Ошибка получения информации о бонусах:", error)
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    if (!bonuses || bonuses.length === 0) {
      return { canClaim: true, streak: 0, lastClaim: null }
    }

    const lastBonus = bonuses[0]
    const lastClaimDate = new Date(lastBonus.claimed_at)
    lastClaimDate.setHours(0, 0, 0, 0)

    const canClaim = today.getTime() > lastClaimDate.getTime()

    return {
      canClaim,
      streak: 0,
      lastClaim: lastBonus.claimed_at,
    }
  } catch (error) {
    console.error("Ошибка в getDailyBonusInfo:", error)
    return { canClaim: true, streak: 0, lastClaim: null }
  }
}

