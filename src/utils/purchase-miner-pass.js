import { supabase } from "../supabase"

/**
 * Функция для покупки Miner Pass
 * @param {string} userId - ID пользователя
 * @param {number} durationDays - Длительность пропуска в днях
 * @param {number} price - Цена пропуска
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function purchaseMinerPass(userId, durationDays = 30, price = 100) {
  try {
    // 1. Проверяем баланс пользователя
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance, has_miner_pass")
      .eq("id", userId)
      .single()

    if (userError) throw new Error("Не удалось получить данные пользователя")
    
    if (userData.balance < price) {
      return {
        success: false,
        message: "Недостаточно средств для покупки Miner Pass"
      }
    }

    // 2. Проверяем, есть ли уже активный Miner Pass
    const { data: existingPass, error: passError } = await supabase
      .from("user_passes")
      .select("*")
      .eq("user_id", userId)
      .eq("pass_type", "miner_pass")
      .eq("is_active", true)
      .gte("expiry_date", new Date().toISOString())
      .maybeSingle()

    // Если уже есть активный пропуск, продлеваем его
    if (!passError && existingPass) {
      const currentExpiry = new Date(existingPass.expiry_date)
      const newExpiry = new Date(currentExpiry)
      newExpiry.setDate(newExpiry.getDate() + durationDays)

      // Обновляем существующий пропуск
      const { error: updateError } = await supabase
        .from("user_passes")
        .update({
          expiry_date: newExpiry.toISOString(),
          purchase_date: new Date().toISOString(),
          purchase_price: price
        })
        .eq("id", existingPass.id)

      if (updateError) throw new Error("Не удалось продлить Miner Pass")

      // Списываем средства
      const { error: balanceError } = await supabase
        .from("users")
        .update({
          balance: userData.balance - price,
          has_miner_pass: true
        })
        .eq("id", userId)

      if (balanceError) throw new Error("Не удалось списать средства")

      return {
        success: true,
        message: "Miner Pass успешно продлен",
        data: {
          expiryDate: newExpiry.toISOString()
        }
      }
    }

    // 3. Создаем новый Miner Pass
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + durationDays)

    const { data: newPass, error: createError } = await supabase
      .from("user_passes")
      .insert({
        user_id: userId,
        pass_type: "miner_pass",
        purchase_date: new Date().toISOString(),
        expiry_date: expiryDate.toISOString(),
        is_active: true,
        purchase_price: price
      })
      .select()
      .single()

    if (createError) throw new Error("Не удалось создать Miner Pass")

    // 4. Списываем средства и обновляем флаг has_miner_pass
    const { error: balanceError } = await supabase
      .from("users")
      .update({
        balance: userData.balance - price,
        has_miner_pass: true
      })
      .eq("id", userId)

    if (balanceError) throw new Error("Не удалось списать средства")

    return {
      success: true,
      message: "Miner Pass успешно приобретен",
      data: {
        expiryDate: expiryDate.toISOString()
      }
    }
  } catch (error) {
    console.error("Ошибка при покупке Miner Pass:", error)
    return {
      success: false,
      message: error.message || "Произошла ошибка при покупке Miner Pass"
    }
  }
}