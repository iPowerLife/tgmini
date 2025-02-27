import { supabase } from "../supabase"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    // Проверяем подключение к базе данных
    const { data: testData, error: testError } = await supabase.from("shop_items").select("count").single()

    if (testError) {
      console.error("Database connection test failed:", testError)
      throw new Error("Ошибка подключения к базе данных")
    }

    // Получаем все предметы из магазина
    const { data: items, error } = await supabase.from("shop_items").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      throw error
    }

    if (!items || items.length === 0) {
      console.warn("No shop items found in database")
      return []
    }

    console.log("Successfully fetched shop items:", items)
    return items
  } catch (error) {
    console.error("Error in getShopItems:", error)
    throw new Error(`Ошибка загрузки предметов: ${error.message}`)
  }
}

export async function getUserItems(userId) {
  try {
    console.log("Fetching user items for user:", userId)

    const { data: items, error } = await supabase
      .from("user_items")
      .select(`
        *,
        shop_items (*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      throw error
    }

    console.log("Successfully fetched user items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getUserItems:", error)
    throw new Error(`Ошибка загрузки инвентаря: ${error.message}`)
  }
}

export async function purchaseItem(userId, item, currentBalance) {
  try {
    console.log("Purchase attempt:", { userId, item, currentBalance })

    if (!userId || !item) {
      throw new Error("Неверные параметры покупки")
    }

    if (currentBalance < item.price) {
      throw new Error("Недостаточно средств")
    }

    // Проверяем существование предмета
    const { data: existingItem, error: checkError } = await supabase
      .from("user_items")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", item.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing item:", checkError)
      throw checkError
    }

    if (existingItem) {
      throw new Error("Предмет уже куплен")
    }

    // Начинаем транзакцию
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        balance: currentBalance - item.price,
        mining_power: supabase.raw(`mining_power + ${item.power_boost}`),
      })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user:", updateError)
      throw updateError
    }

    // Добавляем предмет пользователю
    const { error: purchaseError } = await supabase.from("user_items").insert([
      {
        user_id: userId,
        item_id: item.id,
        quantity: 1,
      },
    ])

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError)
      throw purchaseError
    }

    console.log("Purchase successful:", { updatedUser })
    return updatedUser
  } catch (error) {
    console.error("Error in purchaseItem:", error)
    throw new Error(`Ошибка покупки: ${error.message}`)
  }
}

