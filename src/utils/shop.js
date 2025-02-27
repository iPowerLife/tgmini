import { supabase } from "../supabase"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    // Проверяем подключение к базе данных
    const { data: testData, error: testError } = await supabase.from("shop_items").select("count").single()

    if (testError) {
      console.error("Shop items connection test failed:", testError)
      throw new Error(`Ошибка подключения к магазину: ${testError.message}`)
    }

    console.log("Shop items connection test:", testData)

    // Получаем все предметы из магазина
    const { data: items, error } = await supabase.from("shop_items").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      throw new Error(`Ошибка загрузки предметов: ${error.message}`)
    }

    if (!items || items.length === 0) {
      console.warn("No shop items found in database")
      throw new Error("Предметы магазина не найдены")
    }

    console.log("Successfully fetched shop items:", items)
    return items
  } catch (error) {
    console.error("Error in getShopItems:", error)
    throw error
  }
}

export async function getUserItems(userId) {
  try {
    console.log("Fetching user items for user:", userId)

    const { data: items, error } = await supabase.from("user_items").select("*, shop_items(*)").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      throw new Error(`Ошибка загрузки инвентаря: ${error.message}`)
    }

    console.log("Successfully fetched user items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getUserItems:", error)
    throw error
  }
}

export async function purchaseItem(userId, itemId) {
  try {
    console.log("Purchasing item:", { userId, itemId })

    // Получаем информацию о предмете
    const { data: item, error: itemError } = await supabase.from("shop_items").select("*").eq("id", itemId).single()

    if (itemError) {
      console.error("Error fetching item:", itemError)
      throw new Error(`Ошибка получения информации о предмете: ${itemError.message}`)
    }

    // Получаем информацию о пользователе
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      throw new Error(`Ошибка получения информации о пользователе: ${userError.message}`)
    }

    // Проверяем, достаточно ли средств у пользователя
    if (user.balance < item.price) {
      throw new Error("Недостаточно средств для покупки")
    }

    // Проверяем, не куплен ли уже этот предмет (если max_quantity = 1)
    if (item.max_quantity === 1) {
      const { data: existingItem, error: existingItemError } = await supabase
        .from("user_items")
        .select("*")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single()

      if (existingItemError && existingItemError.code !== "404") {
        console.error("Error checking existing item:", existingItemError)
        throw new Error(`Ошибка проверки наличия предмета: ${existingItemError.message}`)
      }

      if (existingItem) {
        throw new Error("Этот предмет уже куплен")
      }
    } else {
      // Проверяем количество купленных предметов (если max_quantity > 1)
      const { data: existingItems, error: existingItemsError } = await supabase
        .from("user_items")
        .select("*")
        .eq("user_id", userId)
        .eq("item_id", itemId)

      if (existingItemsError) {
        console.error("Error checking existing items:", existingItemsError)
        throw new Error(`Ошибка проверки количества предметов: ${existingItemsError.message}`)
      }

      const totalQuantity = existingItems.reduce((sum, item) => sum + item.quantity, 0)

      if (totalQuantity >= item.max_quantity) {
        throw new Error("Достигнуто максимальное количество для этого предмета")
      }
    }

    // Начинаем транзакцию
    await supabase.rpc("start_transaction")

    try {
      // Списываем средства у пользователя
      const { data: updatedUser, error: updateUserError } = await supabase
        .from("users")
        .update({ balance: user.balance - item.price })
        .eq("id", userId)
        .select()
        .single()

      if (updateUserError) {
        console.error("Error updating user balance:", updateUserError)
        throw new Error(`Ошибка обновления баланса пользователя: ${updateUserError.message}`)
      }

      // Добавляем предмет в инвентарь пользователя
      const { data: newItem, error: newItemError } = await supabase
        .from("user_items")
        .insert([
          {
            user_id: userId,
            item_id: itemId,
            quantity: 1, // Можно увеличить, если поддерживается покупка нескольких штук за раз
          },
        ])
        .select()
        .single()

      if (newItemError) {
        console.error("Error adding item to inventory:", newItemError)
        throw new Error(`Ошибка добавления предмета в инвентарь: ${newItemError.message}`)
      }

      // Логируем транзакцию
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          user_id: userId,
          amount: -item.price,
          type: "purchase",
          description: `Покупка предмета "${item.name}"`,
        },
      ])

      if (transactionError) {
        console.error("Error logging transaction:", transactionError)
        throw new Error(`Ошибка логирования транзакции: ${transactionError.message}`)
      }

      // Применяем эффект предмета (например, увеличение mining_power)
      const { data: finalUser, error: finalUserError } = await supabase
        .from("users")
        .update({ mining_power: user.mining_power + item.power_boost })
        .eq("id", userId)
        .select()
        .single()

      if (finalUserError) {
        console.error("Error applying item effect:", finalUserError)
        throw new Error(`Ошибка применения эффекта предмета: ${finalUserError.message}`)
      }

      // Завершаем транзакцию
      await supabase.rpc("commit_transaction")

      console.log("Item purchased successfully")
      return { success: true, user: finalUser }
    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      await supabase.rpc("rollback_transaction")
      console.error("Error in purchaseItem:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in purchaseItem:", error)
    throw error
  }
}

