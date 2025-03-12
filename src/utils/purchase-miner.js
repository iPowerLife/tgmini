import { supabase } from "../supabase"

/**
 * Функция для покупки майнера
 * @param {string} userId - ID пользователя
 * @param {number} modelId - ID модели майнера
 * @param {number} quantity - Количество майнеров для покупки
 * @param {number} price - Цена за один майнер
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function purchaseMiner(userId, modelId, quantity = 1, price = 100) {
  try {
    // 1. Проверяем баланс пользователя
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (userError) throw new Error("Не удалось получить данные пользователя")
    
    const totalPrice = price * quantity;
    
    if (userData.balance < totalPrice) {
      return {
        success: false,
        message: "Недостаточно средств для покупки майнера"
      }
    }

    // 2. Получаем информацию о модели майнера
    const { data: modelData, error: modelError } = await supabase
      .from("miner_models")
      .select("*")
      .eq("id", modelId)
      .single()

    if (modelError) throw new Error("Не удалось получить данные о модели майнера")

    // 3. Добавляем майнер пользователю с помощью функции add_or_update_miner
    const { data: minerData, error: minerError } = await supabase.rpc('add_or_update_miner', {
      p_user_id: userId,
      p_model_id: modelId,
      p_quantity: quantity
    })

    if (minerError) throw new Error("Не удалось добавить майнер пользователю")

    // 4. Списываем средства
    const { error: balanceError } = await supabase
      .from("users")
      .update({
        balance: userData.balance - totalPrice
      })
      .eq("id", userId)

    if (balanceError) throw new Error("Не удалось списать средства")

    // 5. Записываем транзакцию
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: 'purchase',
        amount: -totalPrice,
        description: `Покупка майнера ${modelData.display_name || modelData.name} x${quantity}`,
        metadata: {
          model_id: modelId,
          quantity: quantity,
          price_per_unit: price
        }
      })

    if (transactionError) {
      console.error("Ошибка при записи транзакции:", transactionError)
      // Не прерываем выполнение, так как майнер уже куплен
    }

    return {
      success: true,
      message: `Майнер ${modelData.display_name || modelData.name} успешно приобретен в количестве ${quantity} шт.`,
      data: {
        model: modelData,
        quantity: quantity
      }
    }
  } catch (error) {
    console.error("Ошибка при покупке майнера:", error)
    return {
      success: false,
      message: error.message || "Произошла ошибка при покупке майнера"
    }
  }
}